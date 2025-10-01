
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { User, UserFormData } from '@/types';
import { getUsers, addUser, updateUser, deleteUser } from '@/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import UserTable from './_components/UserTable';
import UserForm from './_components/UserForm';


export default function AdminUsersPage() {
    const { t, storageKeys } = useSettings();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!storageKeys.users) {
            setIsLoading(false);
            setUsers([]);
            return;
        }
        setIsLoading(true);
        try {
            const fetchedUsers = await getUsers(storageKeys.users);
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Falha ao buscar usuários:", error);
            toast({
                title: "Erro ao Buscar Usuários",
                description: "Não foi possível carregar os usuários do banco de dados.",
                variant: "destructive",
            });
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [storageKeys.users, toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser(storageKeys.users, userId);
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            toast({
                title: "Usuário Excluído",
                description: "O usuário foi excluído com sucesso.",
                variant: "destructive",
            });
        } catch (error) {
            toast({
                title: "Erro ao Excluir",
                description: "Não foi possível excluir o usuário.",
                variant: "destructive",
            });
        }
    };

    const handleFormSubmit = async (data: UserFormData) => {
        try {
            if (editingUser) {
                await updateUser(storageKeys.users, editingUser.id, data);
                toast({
                    title: "Usuário Atualizado",
                    description: `O usuário "${data.name}" foi atualizado com sucesso.`,
                });
            } else {
                await addUser(storageKeys.users, data);
                toast({
                    title: "Usuário Adicionado",
                    description: `O usuário "${data.name}" foi adicionado com sucesso.`,
                });
            }
            fetchUsers();
            setIsFormOpen(false);
            setEditingUser(null);
        } catch (error) {
            toast({
                title: editingUser ? "Erro ao Atualizar" : "Erro ao Adicionar",
                description: "Ocorreu um erro ao salvar os dados do usuário.",
                variant: "destructive",
            });
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            );
        }

        return (
             <>
                <UserTable
                    users={users}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                />
                <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                    setIsFormOpen(isOpen);
                    if (!isOpen) setEditingUser(null);
                    }}>
                    <DialogContent className="sm:max-w-md">
                        <UserForm
                            user={editingUser}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
                    <Users className="mr-3 h-8 w-8" />
                    Gerenciamento de Usuários
                </h1>
                <Button onClick={handleAddUser}>
                    <PlusCircle className="mr-2 h-4 w-4" /> 
                    Adicionar Usuário
                </Button>
            </div>
            {renderContent()}
        </div>
    );
}
