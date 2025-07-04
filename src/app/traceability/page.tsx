
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/context/SettingsContext';
import { ClipboardList, Leaf, Save, Printer, PlusCircle, QrCode, List, Eye } from 'lucide-react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// --- Types ---
interface TraceabilityData {
  id: string;
  createdAt: string;
  lotDescription: string;
  name: string;
  wetCocoaWeight: number | '';
  dryCocoaWeight: number | '';
  fermentationTime: number | '';
  dryingTime: number | '';
  isoClassification: string;
  classificationBoardImageBase64: string | null; // Changed to store Base64
}

// Separate type for form state, without id/createdAt
interface TraceabilityFormData {
  lotDescription: string;
  name: string;
  wetCocoaWeight: number | '';
  dryCocoaWeight: number | '';
  fermentationTime: number | '';
  dryingTime: number | '';
  isoClassification: string;
  classificationBoardImageBase64: string | null; // Changed to store Base64
}

const initialFormData: TraceabilityFormData = {
    lotDescription: '',
    name: '',
    wetCocoaWeight: '',
    dryCocoaWeight: '',
    fermentationTime: '',
    dryingTime: '',
    isoClassification: '',
    classificationBoardImageBase64: null,
};

const LS_LOTS_KEY = 'traceability_lots';

// Helper to convert a file to a Base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function TraceabilityPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  
  type View = 'list' | 'form' | 'details';
  const [view, setView] = useState<View>('form');
  const [lots, setLots] = useState<TraceabilityData[]>([]);
  const [selectedLot, setSelectedLot] = useState<TraceabilityData | null>(null);
  const [formData, setFormData] = useState<TraceabilityFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    try {
      const storedLots = localStorage.getItem(LS_LOTS_KEY);
      if (storedLots) {
        // Basic migration: ensure old data structure doesn't break the new one
        const parsedLots = JSON.parse(storedLots).map((lot: any) => {
            if (lot.classificationBoardImagePreview && !lot.classificationBoardImageBase64) {
                // Cannot recover old blob URLs, but can prevent crashes
                return { ...lot, classificationBoardImageBase64: null };
            }
            return lot;
        });
        setLots(parsedLots);
      }
    } catch (error) {
      console.error("Failed to load lots from localStorage, defaulting to empty.", error);
      setLots([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'details' && selectedLot) {
        const qrCodeDataString = JSON.stringify({
          id: selectedLot.id,
          name: selectedLot.name,
          lotDescription: selectedLot.lotDescription,
          wetCocoaWeight: selectedLot.wetCocoaWeight,
          dryCocoaWeight: selectedLot.dryCocoaWeight,
          fermentationTime: selectedLot.fermentationTime,
          dryingTime: selectedLot.dryingTime,
          isoClassification: selectedLot.isoClassification,
          createdAt: selectedLot.createdAt
        });

      QRCode.toDataURL(qrCodeDataString, { errorCorrectionLevel: 'H', width: 200 })
        .then(url => setQrCodeUrl(url))
        .catch(err => {
          console.error('QR Code generation failed:', err);
          toast({
            variant: 'destructive',
            title: t('traceability.qrCodeErrorTitle', 'Erro na Geração do QR Code'),
            description: t('traceability.qrCodeErrorDescription', 'Não foi possível gerar o QR code para este lote.'),
          });
        });
    }
  }, [view, selectedLot, toast, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const base64 = await fileToBase64(file);
      setFormData((prev) => ({
        ...prev,
        classificationBoardImageBase64: base64,
      }));
    } else {
       setFormData((prev) => ({
        ...prev,
        classificationBoardImageBase64: null,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot: TraceabilityData = {
      ...formData,
      id: `lot-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    const updatedLots = [newLot, ...lots];
    
    setLots(updatedLots);
    localStorage.setItem(LS_LOTS_KEY, JSON.stringify(updatedLots));
    
    setSelectedLot(newLot);
    setView('details');
    
    toast({ 
      title: t('traceability.saveSuccessTitle', 'Sucesso!'), 
      description: t('traceability.saveSuccessDescription', 'O registro de rastreabilidade foi salvo e o QR code foi gerado.'),
    });
  };

  const handleViewDetails = (lot: TraceabilityData) => {
    setSelectedLot(lot);
    setView('details');
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
       <div className="text-left no-print">
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <ClipboardList className="mr-3 h-8 w-8" />
            {t('traceability.pageTitle', 'Rastreabilidade de Lotes de Cacau')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('traceability.pageDescription', 'Registre todas as informações importantes de cada lote de cacau para garantir a qualidade e a rastreabilidade.')}
          </p>
        </div>
        
        <div className="flex justify-end gap-2 no-print">
            {view !== 'list' && (
                <Button variant="outline" onClick={() => setView('list')}>
                <List className="mr-2 h-4 w-4" />
                {t('traceability.viewSavedLotsButton', 'Ver Lotes Salvos')}
                </Button>
            )}
            {view !== 'form' && (
                <Button onClick={() => { setView('form'); setFormData(initialFormData); }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('traceability.registerNewLotButton', 'Registrar Novo Lote')}
                </Button>
            )}
        </div>

        {isLoading ? (
            <Skeleton className="h-64 w-full" />
        ) : view === 'form' ? (
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    {t('traceability.formTitle', 'Formulário de Rastreabilidade do Lote')}
                    </CardTitle>
                    <CardDescription>
                    {t('traceability.formDescription', 'Preencha todos os campos abaixo para criar um novo registro.')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('traceability.nameLabel', 'Nome do Produtor/Lote')}</Label>
                                <Input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder={t('traceability.namePlaceholder', 'Ex: Sítio Esperança - Lote 01/24')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lotDescription">{t('traceability.lotDescriptionLabel', 'Descrição do Lote')}</Label>
                                <Textarea id="lotDescription" value={formData.lotDescription} onChange={handleChange} required placeholder={t('traceability.lotDescriptionPlaceholder', 'Ex: Cacau da colheita de Junho')} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="wetCocoaWeight">{t('traceability.wetCocoaWeightLabel', 'Peso Cacau Mole (kg)')}</Label>
                                <Input type="number" id="wetCocoaWeight" value={formData.wetCocoaWeight} onChange={handleChange} required placeholder="Ex: 500.5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dryCocoaWeight">{t('traceability.dryCocoaWeightLabel', 'Peso Cacau Seco (kg)')}</Label>
                                <Input type="number" id="dryCocoaWeight" value={formData.dryCocoaWeight} onChange={handleChange} required placeholder="Ex: 210.2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fermentationTime">{t('traceability.fermentationTimeLabel', 'Tempo de Fermentação (dias)')}</Label>
                                <Input type="number" id="fermentationTime" value={formData.fermentationTime} onChange={handleChange} required placeholder="Ex: 7" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dryingTime">{t('traceability.dryingTimeLabel', 'Tempo de Secagem (dias)')}</Label>
                                <Input type="number" id="dryingTime" value={formData.dryingTime} onChange={handleChange} required placeholder="Ex: 10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="isoClassification">{t('traceability.isoClassificationLabel', 'Classificação Física (ISO-2451)')}</Label>
                            <Input type="text" id="isoClassification" value={formData.isoClassification} onChange={handleChange} required placeholder={t('traceability.isoClassificationPlaceholder', 'Ex: Grau I, Tipo A')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="classificationBoardImage">{t('traceability.boardImageLabel', 'Imagem da Tábua de Classificação')}</Label>
                            <Input type="file" id="classificationBoardImage" accept="image/*" onChange={handleFileChange} required className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                            {formData.classificationBoardImageBase64 && (
                                <div className="mt-4">
                                <Image src={formData.classificationBoardImageBase64} alt={t('traceability.boardImagePreviewAlt', 'Prévia da imagem da tábua')} width={200} height={200} className="rounded-md border object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit"> <Save className="mr-2 h-4 w-4" /> {t('traceability.saveButton', 'Salvar Registro de Rastreabilidade')} </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        ) : view === 'list' ? (
             <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><List className="h-5 w-5 text-primary" />{t('traceability.savedLotsTitle', 'Lotes de Cacau Registrados')}</CardTitle>
                    <CardDescription>{t('traceability.savedLotsDescription', 'Visualize e gerencie todos os lotes de cacau que você registrou.')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('traceability.tableHeader.lotName', 'Nome do Lote/Produtor')}</TableHead>
                                    <TableHead>{t('traceability.tableHeader.createdAt', 'Data de Criação')}</TableHead>
                                    <TableHead className="text-center">{t('traceability.tableHeader.dryWeight', 'Peso Seco (kg)')}</TableHead>
                                    <TableHead className="text-right">{t('traceability.tableHeader.actions', 'Ações')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lots.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">{t('traceability.noLotsFound', 'Nenhum lote registrado ainda. Comece registrando um novo lote.')}</TableCell>
                                    </TableRow>
                                ) : (
                                    lots.map(lot => (
                                        <TableRow key={lot.id}>
                                            <TableCell className="font-medium">{lot.name}</TableCell>
                                            <TableCell>{new Date(lot.createdAt).toLocaleDateString(t('localeCode', 'pt-BR'))}</TableCell>
                                            <TableCell className="text-center">{lot.dryCocoaWeight || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(lot)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    {t('traceability.viewDetailsButton', 'Ver Detalhes')}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        ) : view === 'details' && selectedLot ? (
            <>
                <style>{`
                    @media print {
                    body * { visibility: hidden; }
                    .printable-area, .printable-area * { visibility: visible; }
                    .printable-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 2rem; }
                    .no-print { display: none !important; }
                    }
                `}</style>
                <Card className="w-full shadow-lg printable-area">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <QrCode className="h-6 w-6"/>
                            {t('traceability.qrCodeTitle', 'Lote Registrado e QR Code Gerado')}
                        </CardTitle>
                        <CardDescription>
                        {t('traceability.qrCodeDescription', 'O QR Code abaixo contém todas as informações do lote. Imprima-o para anexar ao lote físico.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 p-6">
                        <div className="text-center p-4 border rounded-lg bg-white h-[216px] w-[216px] flex items-center justify-center">
                        {qrCodeUrl ? (
                            <Image src={qrCodeUrl} alt={t('traceability.qrCodeAlt', 'QR Code for lot {name}', {name: selectedLot.name})} width={200} height={200} />
                        ) : (
                            <Skeleton className="h-[200px] w-[200px]" />
                        )}
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg">{t('traceability.lotDetails', 'Detalhes do Lote')}</h4>
                            <p><strong>{t('traceability.nameLabel', 'Nome do Produtor/Lote')}:</strong> {selectedLot.name}</p>
                            <p><strong>{t('traceability.lotDescriptionLabel', 'Descrição do Lote')}:</strong> {selectedLot.lotDescription}</p>
                            <p><strong>{t('traceability.wetCocoaWeightLabel', 'Peso Cacau Mole (kg)')}:</strong> {selectedLot.wetCocoaWeight}</p>
                            <p><strong>{t('traceability.dryCocoaWeightLabel', 'Peso Cacau Seco (kg)')}:</strong> {selectedLot.dryCocoaWeight}</p>
                            <p><strong>{t('traceability.fermentationTimeLabel', 'Tempo de Fermentação (dias)')}:</strong> {selectedLot.fermentationTime}</p>
                            <p><strong>{t('traceability.dryingTimeLabel', 'Tempo de Secagem (dias)')}:</strong> {selectedLot.dryingTime}</p>
                            <p><strong>{t('traceability.isoClassificationLabel', 'Classificação Física (ISO-2451)')}:</strong> {selectedLot.isoClassification}</p>
                            {selectedLot.classificationBoardImageBase64 && (
                                <div>
                                <strong>{t('traceability.boardImageLabel', 'Imagem da Tábua de Classificação')}:</strong>
                                <Image src={selectedLot.classificationBoardImageBase64} alt={t('traceability.boardImagePreviewAlt', 'Prévia da imagem da tábua')} width={100} height={100} className="rounded-md border object-cover mt-2" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 no-print">
                        <Button variant="outline" onClick={() => setView('list')}>
                           <List className="mr-2 h-4 w-4"/> {t('traceability.backToListButton', 'Voltar para a Lista')}
                        </Button>
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4"/> {t('traceability.printButton', 'Imprimir Etiqueta')}
                        </Button>
                    </CardFooter>
                </Card>
            </>
        ) : null}
    </div>
  );
}
