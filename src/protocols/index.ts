import type { Protocol } from '@/types/protocol';
import { showerProtocol } from './shower';
import { bedtimeProtocol } from './bedtime';
import { cleaningProtocol } from './cleaning';
import { energyProtocol } from './energy';
import { whatToWearProtocol } from './what-to-wear';
import { laundryProtocol } from './sub/laundry';
import { shoppingProtocol } from './sub/shopping';

// Default protocols shipped with the app (read-only)
export const defaultProtocols: Record<string, Protocol> = {
  [showerProtocol.id]: showerProtocol,
  [bedtimeProtocol.id]: bedtimeProtocol,
  [cleaningProtocol.id]: cleaningProtocol,
  [energyProtocol.id]: energyProtocol,
  [whatToWearProtocol.id]: whatToWearProtocol,
  [laundryProtocol.id]: laundryProtocol,
  [shoppingProtocol.id]: shoppingProtocol,
};

// Keep the old export for backward compatibility during transition
export const protocols = defaultProtocols;

// Only show these on the home page (not sub-protocols)
export const mainProtocols = [
  showerProtocol,
  bedtimeProtocol,
  cleaningProtocol,
  energyProtocol,
  whatToWearProtocol,
];
