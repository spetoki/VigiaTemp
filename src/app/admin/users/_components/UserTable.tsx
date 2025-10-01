
"use client";

import React from 'react';
import { User } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Shield, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  
  const roleDisplay = {
    admin: { label: 'Admin', icon: Shield, className: 'bg-primary/10 text-primary border-primary/50' },
    viewer: { label: 'Viewer', icon: Eye, className: 'bg-secondary text-secondary-foreground' },
  };

  const statusDisplay = {
      active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div className="rounded-lg border overflow-hidden shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Função</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const roleInfo = roleDisplay[user.role];
              const RoleIcon = roleInfo.icon;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn("font-medium", roleInfo.className)}>
                        <RoleIcon className="mr-1 h-3.5 w-3.5" />
                        {roleInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={statusDisplay[user.status].className}>{statusDisplay[user.status].label}</Badge>
                  </TableCell>
                   <TableCell className="text-center">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon">
                           <Trash2 className="h-4 w-4 text-destructive" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Tem certeza que deseja excluir este usuário?</AlertDialogTitle>
                           <AlertDialogDescription>
                             Esta ação não pode ser desfeita. O usuário "{user.name}" será permanentemente removido.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancelar</AlertDialogCancel>
                           <AlertDialogAction onClick={() => onDelete(user.id)} className="bg-destructive hover:bg-destructive/90">
                             Excluir
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
