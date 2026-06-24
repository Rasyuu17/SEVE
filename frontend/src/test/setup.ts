import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import Modal from 'react-modal';

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);
Modal.setAppElement('#root');

afterEach(() => {
  cleanup();
});