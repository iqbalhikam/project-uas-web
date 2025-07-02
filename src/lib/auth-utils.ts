// src/lib/auth-utils.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { error: 'Akses ditolak. Tindakan ini memerlukan hak akses Admin.' };
  }
  return { success: true, session };
}
