import React from 'react';
import { ErrorBoundary } from '../utils/errorHandling';

interface AppWrapperProps {
    children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
}
