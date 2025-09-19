import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function generateVoucherId(): string {
  // Generate a random 32-byte hex string for voucher ID
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
