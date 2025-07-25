
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/context/SettingsContext';
import { ClipboardList, Leaf, Save, Printer, PlusCircle, QrCode, List, Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { TraceabilityData, addLot, getLots, TraceabilityFormData } from '@/services/traceability-service';

const initialFormData: TraceabilityFormData = {
    lotDescription: '',
    name: '',
    wetCocoaWeight: '',
    dryCocoaWeight: '',
    fermentationTime: '',
    dryingTime: '',
    isoClassification: '',
};

export default function TraceabilityPage() {
  const { t, activeKey } = useSettings();
  const { toast } = useToast();
  
  type View = 'list' | 'form' | 'details';
  const [view, setView] = useState<View>('form');
  const [lots, setLots] = useState<TraceabilityData[]>([]);
  const [selectedLot, setSelectedLot] = useState<TraceabilityData | null>(null);
  const [formData, setFormData] = useState<TraceabilityFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  const fetchLots = useCallback(async () => {
    if (!activeKey) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
        const fetchedLots = await getLots(activeKey);
        setLots(fetchedLots);
    } catch (error) {
        toast({
            title: t('traceability.loadErrorTitle', "Erro ao Carregar Lotes"),
            description: t('traceability.loadErrorDescription', "Não foi possível buscar os lotes salvos."),
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  }, [activeKey, t, toast]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKey) {
        toast({
            title: t('traceability.saveErrorTitle', "Erro ao Salvar"),
            description: t('traceability.saveErrorNoUser', "Chave de acesso não encontrada. Não é possível salvar o lote."),
            variant: "destructive"
        });
        return;
    }
    setIsSubmitting(true);

    try {
        const newLot = await addLot(activeKey, formData);
        
        setLots(prevLots => [newLot, ...prevLots]);
        setSelectedLot(newLot);
        setView('details');
        setFormData(initialFormData); // Clear form
        toast({ 
          title: t('traceability.saveSuccessTitle', 'Sucesso!'), 
          description: t('traceability.saveSuccessDescription', 'O registro de rastreabilidade foi salvo e o QR code foi gerado.'),
        });
    } catch (error) {
         toast({
            title: t('traceability.saveErrorTitle', "Erro ao Salvar"),
            description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
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
                <Button onClick={() => { setView('form'); setFormData(initialFormData); setSelectedLot(null); }}>
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
                        
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                     {t('traceability.savingButton', 'Salvando...')}
                                    </>
                                ) : (
                                    <>
                                     <Save className="mr-2 h-4 w-4" />
                                     {t('traceability.saveButton', 'Salvar Registro de Rastreabilidade')}
                                    </>
                                )}
                            </Button>
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
