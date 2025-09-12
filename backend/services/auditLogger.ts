import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.log');

function ensureLogFile() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '', { mode: 0o600 });
  }
}

export interface DonationLogEntry {
  action: 'created' | 'refunded';
  donationId: string;
  amount: number;
  userId?: string;
  timestamp: string;
}

function logDonationEvent(entry: Omit<DonationLogEntry, 'timestamp'>) {
  ensureLogFile();
  const record: DonationLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  fs.appendFileSync(LOG_FILE, JSON.stringify(record) + '\n', {
    encoding: 'utf8',
    mode: 0o600,
  });
}

export const logDonationCreated = (
  donationId: string,
  amount: number,
  userId?: string,
) => {
  logDonationEvent({ action: 'created', donationId, amount, userId });
};

export const logDonationRefunded = (
  donationId: string,
  amount: number,
  userId?: string,
) => {
  logDonationEvent({ action: 'refunded', donationId, amount, userId });
};

export default { logDonationCreated, logDonationRefunded };
