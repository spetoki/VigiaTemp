
"use client";

import React, { useEffect, useState } from 'react';
import type { User } from '@/types';
import { demoUsers } from '@/lib/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, UserPlus, Users, Crown, Coins, Save } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // Mantido pois pode ser usado em outros lugares
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LS_USERS_KEY = 'vigiatemp_admin_users';


export default function AdminUsersPage() {
  const { t } = useSettings();
  const { authState } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  useEffect(() => {
    if (authState === 'unauthenticated' || authState === 'user') {
      router.push('/login');
      return;
    }
    if (authState === 'admin') {
      try {
        const storedUsers = localStorage.getItem(LS_USERS_KEY);
        if (storedUsers) {
          const parsedUsers: any[] = JSON.parse(storedUsers);
          const cleanedUsers: User[] = parsedUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            status: u.status,
            joinedDate: u.joinedDate,
            tempCoins: u.tempCoins,
          }));
          setUsers(cleanedUsers);
        } else {
          setUsers(demoUsers);
          localStorage.setItem(LS_USERS_KEY, JSON.stringify(demoUsers));
        }
      } catch (error) {
        console.error("Failed to process users from localStorage", error);
        setUsers(demoUsers);
      } finally {
        setIsLoading(false);
      }
    }
  }, [authState, router]);
  
  const handleSaveUser = (updatedUser: User) => {
    setUsers(currentUsers => {
      const newUsers = currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(newUsers));
      return newUsers;
    });
    setEditingUser(null);
  };
  
  const handleAddNewUser = (newUser: Omit<User, 'id' | 'joinedDate'>) => {
    const finalNewUser: User = {
        id: `user-${Date.now()}`,
        joinedDate: new Date().toISOString().split('T')[0],
        ...newUser
    };
    setUsers(currentUsers => {
        const newUsers = [finalNewUser, ...currentUsers];
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(newUsers));
        return newUsers;
    });
    setIsAddUserDialogOpen(false);
  };


  if (isLoading || authState === 'loading' || authState !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-10 w-44" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className='flex items-center gap-2'>
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-primary">{t('admin.usersPage.title', 'Gerenciamento de Usuários')}</h1>
          </div>
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> {t('admin.usersPage.addUserButton', 'Adicionar Novo Usuário')}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {t('admin.usersPage.description', 'Visualize, edite e gerencie as contas de todos os usuários do sistema.')}
        </p>

        <div className="rounded-lg border overflow-hidden shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.usersTable.name', 'Nome')}</TableHead>
                <TableHead>{t('admin.usersTable.email', 'Email')}</TableHead>
                <TableHead>{t('admin.usersTable.role', 'Função')}</TableHead>
                <TableHead className="text-center">{t('admin.usersTable.status', 'Status')}</TableHead>
                <TableHead className="flex items-center gap-1"><Coins className="h-4 w-4 text-muted-foreground"/>{t('admin.usersTable.tempCoins', 'TempCoins')}</TableHead>
                <TableHead>{t('admin.usersTable.joined', 'Registrado em')}</TableHead>
                <TableHead className="text-right">{t('admin.usersTable.actions', 'Ações')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                    {t('admin.usersTable.noUsers', 'Nenhum usuário encontrado.')}
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}
                          className={user.role === 'Admin' ? 'bg-primary text-primary-foreground' : ''}>
                      {t(`admin.userRole.${user.role.toLowerCase()}`, user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                          variant={user.status === 'Active' ? 'secondary' : user.status === 'Pending' ? 'outline' : 'destructive'}
                          className={
                              user.status === 'Active' ? 'bg-green-100 text-green-800 border-green-300' :
                              user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-red-100 text-red-800 border-red-300'
                          }>
                      {t(`admin.userStatus.${user.status.toLowerCase()}`, user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-center">
                    {(user.tempCoins || 0).toLocaleString(t('localeCode', 'pt-BR'))}
                  </TableCell>
                  <TableCell>{new Date(user.joinedDate).toLocaleDateString(t('localeCode', 'pt-BR'))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label={`${t('admin.usersTable.editAction', 'Editar')} ${user.name}`} onClick={() => setEditingUser(user)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`${t('admin.usersTable.deleteAction', 'Excluir')} ${user.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setEditingUser(null)}
        />
      )}
       {isAddUserDialogOpen && (
        <AddUserDialog
          onSave={handleAddNewUser}
          onClose={() => setIsAddUserDialogOpen(false)}
          existingUsers={users}
        />
      )}
    </>
  );
}

// --- Edit User Dialog Component ---
interface EditUserDialogProps {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

function EditUserDialog({ user, onSave, onClose }: EditUserDialogProps) {
  const { t } = useSettings();
  
  // State for all editable fields
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<'Admin' | 'User'>(user.role);
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Pending'>(user.status);
  const [tempCoins, setTempCoins] = useState(user.tempCoins || 0);
  const [password, setPassword] = useState('');

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      name,
      role,
      status,
      tempCoins,
      password: password ? password : user.password,
    };
    onSave(updatedUser);
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('admin.editUserDialog.title', 'Editar Usuário: {name}', { name: user.name })}</DialogTitle>
          <DialogDescription>
            {t('admin.editUserDialog.description', 'Ajuste os detalhes, status e permissões do usuário abaixo.')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t('admin.usersTable.name', 'Nome')}</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="edit-email">{t('admin.usersTable.email', 'Email')}</Label>
            <Input id="edit-email" value={user.email} disabled />
          </div>
          {/* Password */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-password">{t('admin.editUserDialog.passwordLabel', 'Nova Senha (deixe em branco para não alterar)')}</Label>
            <Input id="edit-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="edit-role">{t('admin.usersTable.role', 'Função')}</Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'Admin' | 'User')}>
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">{t('admin.userRole.user', 'User')}</SelectItem>
                <SelectItem value="Admin">{t('admin.userRole.admin', 'Admin')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="edit-status">{t('admin.usersTable.status', 'Status')}</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'Active' | 'Inactive' | 'Pending')}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">{t('admin.userStatus.active', 'Active')}</SelectItem>
                <SelectItem value="Inactive">{t('admin.userStatus.inactive', 'Inactive')}</SelectItem>
                <SelectItem value="Pending">{t('admin.userStatus.pending', 'Pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* TempCoins */}
          <div className="space-y-2">
            <Label htmlFor="edit-tempCoins" className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              {t('admin.usersTable.tempCoins', 'TempCoins')}
            </Label>
            <Input
              id="edit-tempCoins"
              type="number"
              value={tempCoins}
              onChange={(e) => setTempCoins(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose}>{t('sensorForm.cancelButton', 'Cancelar')}</Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {t('admin.editUserDialog.save', 'Salvar Alterações')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Add User Dialog Component ---
interface AddUserDialogProps {
  onSave: (user: Omit<User, 'id' | 'joinedDate'>) => void;
  onClose: () => void;
  existingUsers: User[];
}

function AddUserDialog({ onSave, onClose, existingUsers }: AddUserDialogProps) {
  const { t } = useSettings();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'User' | 'Admin'>('User');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');
  const [tempCoins, setTempCoins] = useState(0);
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (!name || !email || !password) {
      setError('Nome, email e senha são obrigatórios.');
      return;
    }
    if (existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('Este email já está em uso.');
        return;
    }

    const newUser: Omit<User, 'id' | 'joinedDate'> = {
      name,
      email,
      password,
      role,
      status,
      tempCoins,
    };
    onSave(newUser);
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('admin.usersPage.addUserButton', 'Adicionar Novo Usuário')}</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar uma nova conta de usuário.\n          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-2">
          <div className="space-y-2">
            <Label htmlFor="add-name">{t('admin.usersTable.name', 'Nome')}</Label>
            <Input id="add-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-email">{t('admin.usersTable.email', 'Email')}</Label>
            <Input id="add-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="add-password">Senha</Label>
            <Input id="add-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="add-role">{t('admin.usersTable.role', 'Função')}</Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'Admin' | 'User')}>
              <SelectTrigger id="add-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">{t('admin.userRole.user', 'User')}</SelectItem>
                <SelectItem value="Admin">{t('admin.userRole.admin', 'Admin')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-status">{t('admin.usersTable.status', 'Status')}</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'Active' | 'Inactive' | 'Pending')}>
              <SelectTrigger id="add-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">{t('admin.userStatus.active', 'Active')}</SelectItem>
                <SelectItem value="Inactive">{t('admin.userStatus.inactive', 'Inactive')}</SelectItem>
                <SelectItem value="Pending">{t('admin.userStatus.pending', 'Pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-tempCoins" className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              {t('admin.usersTable.tempCoins', 'TempCoins')}\n            </Label>
            <Input
              id="add-tempCoins"
              type="number"
              value={tempCoins}
              onChange={(e) => setTempCoins(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          {error && <p className="text-destructive text-sm col-span-2">{error}</p>}
        </div>
        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose}>{t('sensorForm.cancelButton', 'Cancelar')}</Button>
          <Button onClick={handleSave}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('admin.usersPage.addUserButton', 'Adicionar Usuário')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
