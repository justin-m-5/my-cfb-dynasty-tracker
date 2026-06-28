// components/ui/page-container.tsx

import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    className?: string;
}

/** Standard page content wrapper — max-width, centered, vertical spacing. */
export default function PageContainer({ children, className }: Props) {
    return (
        <div className={`space-y-6 ${className ?? ""}`.trim()}>
            {children}
        </div>
    );
}
