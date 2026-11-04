import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom chưa cài đặt API modal của <dialog>
HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  this.open = false;
};

afterEach(() => {
  cleanup();
});
