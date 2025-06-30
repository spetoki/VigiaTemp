'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useSettings } from '@/context/SettingsContext';
import { ClipboardList, Leaf, Save, Printer, PlusCircle, QrCode } from 'lucide-react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


interface TraceabilityData {
  lotDescription: string;
  name: string;
  wetCocoaWeight: number | '';
  dryCocoaWeight: number | '';
  fermentationTime: number | '';
  dryingTime: number | '';
  isoClassification: string;
  classificationBoardImage: File | null;
  classificationBoardImagePreview: string | null;
}

const initialFormData: TraceabilityData = {
    lotDescription: '',
    name: '',
    wetCocoaWeight: '',
    dryCocoaWeight: '',
    fermentationTime: '',
    dryingTime: '',
    isoClassification: '',
    classificationBoardImage: null,
    classificationBoardImagePreview: null,
};


export default function TraceabilityPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState<TraceabilityData>(initialFormData);
  const [submittedData, setSubmittedData] = useState<TraceabilityData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');


  useEffect(() => {
    if (submittedData) {
      const qrCodeDataString = JSON.stringify({
        ...submittedData,
        classificationBoardImage: submittedData.classificationBoardImage?.name || 'N/A',
        classificationBoardImagePreview: undefined, // Don't include the preview in the QR code
      });

      QRCode.toDataURL(qrCodeDataString, { errorCorrectionLevel: 'H' })
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error('QR Code generation failed:', err);
          toast({
            variant: 'destructive',
            title: t('traceability.qrCodeErrorTitle', 'Erro na Geração do QR Code'),
            description: t('traceability.qrCodeErrorDescription', 'Não foi possível gerar o QR code para este lote.'),
          });
        });
    }
  }, [submittedData, toast, t]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      classificationBoardImage: file,
      classificationBoardImagePreview: file ? URL.createObjectURL(file) : null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData(formData);
    toast({ 
      title: t('traceability.saveSuccessTitle', 'Sucesso!'), 
      description: t('traceability.saveSuccessDescription', 'O registro de rastreabilidade foi salvo e o QR code foi gerado.'),
    });
  };
  
  const handleRegisterNew = () => {
    setSubmittedData(null);
    setFormData(initialFormData);
    setQrCodeUrl('');
  };

  const handlePrint = () => {
    window.print();
  };


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

      {!submittedData ? (
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
                    <Textarea
                      id="lotDescription"
                      value={formData.lotDescription}
                      onChange={handleChange}
                      required
                      placeholder={t('traceability.lotDescriptionPlaceholder', 'Ex: Cacau da colheita de Junho')}
                    />
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
                {formData.classificationBoardImagePreview && (
                  <div className="mt-4">
                    <Image src={formData.classificationBoardImagePreview} alt={t('traceability.boardImagePreviewAlt', 'Prévia da imagem da tábua')} width={200} height={200} className="rounded-md border object-cover" />
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
                  <Button type="submit"> <Save className="mr-2 h-4 w-4" /> {t('traceability.saveButton', 'Salvar Registro de Rastreabilidade')} </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .printable-area, .printable-area * { visibility: visible; }
              .printable-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
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
                      <Image src={qrCodeUrl} alt={t('traceability.qrCodeAlt', 'QR Code for lot {name}', {name: submittedData.name})} width={200} height={200} />
                   ) : (
                      <Skeleton className="h-[200px] w-[200px]" />
                   )}
                </div>
                <div className="space-y-2">
                    <h4 className="font-bold text-lg">{t('traceability.lotDetails', 'Detalhes do Lote')}</h4>
                    <p><strong>{t('traceability.nameLabel', 'Nome do Produtor/Lote')}:</strong> {submittedData.name}</p>
                    <p><strong>{t('traceability.lotDescriptionLabel', 'Descrição do Lote')}:</strong> {submittedData.lotDescription}</p>
                    <p><strong>{t('traceability.wetCocoaWeightLabel', 'Peso Cacau Mole (kg)')}:</strong> {submittedData.wetCocoaWeight}</p>
                    <p><strong>{t('traceability.dryCocoaWeightLabel', 'Peso Cacau Seco (kg)')}:</strong> {submittedData.dryCocoaWeight}</p>
                    <p><strong>{t('traceability.fermentationTimeLabel', 'Tempo de Fermentação (dias)')}:</strong> {submittedData.fermentationTime}</p>
                    <p><strong>{t('traceability.dryingTimeLabel', 'Tempo de Secagem (dias)')}:</strong> {submittedData.dryingTime}</p>
                    <p><strong>{t('traceability.isoClassificationLabel', 'Classificação Física (ISO-2451)')}:</strong> {submittedData.isoClassification}</p>
                    {submittedData.classificationBoardImagePreview && (
                        <div>
                          <strong>{t('traceability.boardImageLabel', 'Imagem da Tábua de Classificação')}:</strong>
                           <Image src={submittedData.classificationBoardImagePreview} alt={t('traceability.boardImagePreviewAlt', 'Prévia da imagem da tábua')} width={100} height={100} className="rounded-md border object-cover mt-2" />
                        </div>
                    )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 no-print">
                 <Button variant="outline" onClick={handleRegisterNew}> <PlusCircle className="mr-2 h-4 w-4"/> {t('traceability.newLotButton', 'Registrar Novo Lote')} </Button>
                 <Button onClick={handlePrint}> <Printer className="mr-2 h-4 w-4"/> {t('traceability.printButton', 'Imprimir Etiqueta')} </Button>
              </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
