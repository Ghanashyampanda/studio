"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, User, Mail, Calendar, Trash2, AlertTriangle, ShieldAlert, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const handleDeleteAccount = async () => {
    if (!user || !db) return;
    setIsDeleting(true);
    
    const userDocRef = doc(db, 'users', user.uid);

    try {
      // 1. DATA WIPE: Remove the primary profile node from Firestore first
      await deleteDoc(userDocRef);
      
      // 2. AUTH TERMINATION: Permanently delete the user's authentication account
      await deleteUser(user);
      
      toast({ 
        title: "Account Permanently Deleted", 
        description: "Your identity and telemetry have been purged from the network." 
      });
      
      router.push('/');
    } catch (error: any) {
      // Handle re-authentication requirement for sensitive operations
      if (error.code === 'auth/requires-recent-login') {
        toast({ 
          title: "Re-authentication Required", 
          description: "For security, please logout and log back in to verify your identity before deleting your account.",
          variant: "destructive" 
        });
      } else if (error.code?.includes('permission-denied') || error.message?.toLowerCase().includes('permission')) {
        // Emit contextual error for Security Rules debugging
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        toast({ 
          title: "Deletion Protocol Failed", 
          description: "An unexpected error occurred. Please try again or contact support.",
          variant: "destructive" 
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 font-body">
      <main className="max-w-4xl mx-auto px-6 space-y-12">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <SettingsIcon className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">User Profile Configuration</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
            Account <span className="text-primary">Settings</span>
          </h1>
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
            Manage your personal data nodes and system authorization.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Identity Card */}
          <Card className="rounded-[3rem] border border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground">
                <User className="h-6 w-6 text-primary" />
                Profile Intelligence
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Verified Identity Parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Identity Designation</p>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">{user.displayName || 'Not Set'}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Communication Channel</p>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">{user.email}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Auth Protocol UID</p>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-mono font-black text-muted-foreground truncate">{user.uid}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Node Establishment Date</p>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">
                      {profile?.dateCreated ? format(new Date(profile.dateCreated), 'MMM dd, yyyy') : 'Recently established'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="rounded-[3rem] border-destructive/20 border-2 shadow-sm overflow-hidden bg-destructive/5">
            <CardHeader className="p-8 border-b border-destructive/10">
              <CardTitle className="text-xl font-black uppercase tracking-tight text-destructive flex items-center gap-3">
                <ShieldAlert className="h-6 w-6" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-destructive/60">
                Irreversible Data Destruction Protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h4 className="text-sm font-black uppercase tracking-tight text-foreground">DELETE PROFILE PERMANENTLY</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-xl">
                    By activating this protocol, your account will be deleted and all associated physiological telemetry, habit grids, and emergency contacts will be permanently purged from our servers.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      disabled={isDeleting}
                      className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-destructive/20 w-full sm:w-auto transition-all active:scale-95"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      DELETE YOUR ACCOUNT
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-background p-8">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                        This action cannot be undone. All telemetry history, habits, and emergency nodes will be wiped from the SunCare Alert network permanently.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-4">
                      <AlertDialogCancel className="h-12 rounded-xl border-border text-[10px] font-black uppercase tracking-widest">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount} 
                        className="h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[10px] font-black uppercase tracking-widest"
                      >
                        YES, DELETE ACCOUNT
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')} 
                  className="h-14 px-8 rounded-2xl border-border text-foreground font-black uppercase tracking-widest text-[11px] w-full sm:w-auto"
                >
                  Back to Command Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}