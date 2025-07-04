
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Edit, Camera, MapPin, Building, Warehouse, Mail, Phone, MessageSquare, Coins } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function UserProfilePage() {
  const { t } = useSettings();

  // Placeholder user data
  const user = {
    name: t('userProfile.exampleName', "Usuário Exemplo Completo"),
    email: "usuario@exemplo.com",
    avatarUrl: "https://placehold.co/100x100.png",
    initials: "UE",
    memberSince: t('userProfile.exampleMemberSince', "Jan 2023"),
    lastLogin: t('userProfile.exampleLastLogin', "15 de Julho de 2024"),
    sex: t('userProfile.exampleSex', "Não especificado"),
    age: t('userProfile.exampleAge', "30"),
    address: t('userProfile.exampleAddress', "Rua das Palmeiras, 123, Cidade Alegre, UF"),
    farmName: t('userProfile.exampleFarmName', "Sítio Esperança"),
    greenhouseCount: t('userProfile.exampleGreenhouseCount', "5"),
    contactEmail: "contato.usuario@exemplo.com",
    whatsapp: t('userProfile.exampleWhatsapp', "+55 (11) 98765-4321"),
    phone: t('userProfile.examplePhone', "+55 (11) 1234-5678"),
    tempCoins: 1250,
  };

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary">{t('userProfile.title', 'Painel do Usuário')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('userProfile.description', 'Visualize e gerencie as informações do seu perfil.')}
        </p>
      </div>

      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center pb-4 border-b">
          <div className="relative">
            <Avatar className="w-24 h-24 mb-2 ring-2 ring-primary ring-offset-2">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile person" />
              <AvatarFallback><User className="w-12 h-12" /></AvatarFallback>
            </Avatar>
            <Button variant="outline" size="icon" className="absolute bottom-2 right-0 rounded-full h-8 w-8 bg-background">
              <Camera className="h-4 w-4" />
              <span className="sr-only">{t('userProfile.changePhotoButton', 'Alterar Foto')}</span>
            </Button>
          </div>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
           <Button variant="outline" size="sm" className="mt-4">
                <Edit className="mr-2 h-4 w-4" />
                {t('userProfile.editProfileButton', 'Editar Perfil')}
            </Button>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
              <User className="mr-2 h-5 w-5" />
              {t('userProfile.personalInfoTitle', 'Informações Pessoais')}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground pl-7">
              <p><strong>{t('userProfile.fullNameLabel', 'Nome Completo')}:</strong> {user.name}</p>
              <p><strong>{t('userProfile.sexLabel', 'Sexo')}:</strong> {user.sex}</p>
              <p><strong>{t('userProfile.ageLabel', 'Idade')}:</strong> {user.age}</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
              <Coins className="mr-2 h-5 w-5 text-yellow-500" />
              {t('userProfile.walletTitle', 'Minha Carteira')}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground pl-7">
              <p>
                <strong>{t('userProfile.tempCoinsBalance', 'Saldo TempCoins')}:</strong>
                <span className="font-bold text-lg text-foreground ml-2 font-mono">{user.tempCoins.toLocaleString(t('localeCode', 'pt-BR'))}</span>
              </p>
            </div>
          </div>


          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              {t('userProfile.addressTitle', 'Endereço')}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground pl-7">
              <p><strong>{t('userProfile.addressLabel', 'Endereço Completo')}:</strong> {user.address}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
              <Building className="mr-2 h-5 w-5" />
              {t('userProfile.propertyInfoTitle', 'Informações da Propriedade')}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground pl-7">
              <p><strong>{t('userProfile.farmNameLabel', 'Nome do Sítio/Fazenda')}:</strong> {user.farmName}</p>
              <p>
                <strong className="flex items-center">
                  <Warehouse className="mr-1 h-4 w-4" />
                  {t('userProfile.greenhouseCountLabel', 'Quantidade de Estufas')}:
                </strong> 
                {user.greenhouseCount}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              {t('userProfile.contactInfoTitle', 'Informações de Contato')}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground pl-7">
              <p>
                <strong className="flex items-center">
                    <Mail className="mr-1 h-4 w-4" />
                    {t('userProfile.contactEmailLabel', 'E-mail de Contato')}:
                </strong> {user.contactEmail}
              </p>
              <p>
                <strong className="flex items-center">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    {t('userProfile.whatsappLabel', 'WhatsApp')}:
                </strong> {user.whatsapp}
              </p>
              <p>
                <strong className="flex items-center">
                    <Phone className="mr-1 h-4 w-4" />
                    {t('userProfile.phoneLabel', 'Celular/Telefone')}:
                </strong> {user.phone}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">{t('userProfile.activityTitle', 'Atividade da Conta')}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>{t('userProfile.memberSince', 'Membro desde')}:</strong> {user.memberSince}</p>
                <p><strong>{t('userProfile.lastLogin', 'Último Login')}:</strong> {user.lastLogin}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">{t('userProfile.accountSettingsTitle', 'Configurações da Conta')}</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left sm:w-auto">
                {t('userProfile.changePasswordButton', 'Alterar Senha')}
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">{t('userProfile.notificationPreferencesTitle', 'Preferências de Notificação')}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('userProfile.notificationPreferencesPlaceholder', 'Ajuste suas preferências de notificação aqui (ex: alertas por email, push).')}
            </p>
            <Button variant="outline" size="sm">
                {t('userProfile.manageNotificationsButton', 'Gerenciar Notificações')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
