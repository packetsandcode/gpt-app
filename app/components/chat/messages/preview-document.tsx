import { useMemo } from "react";
import { memo } from "react";
import { Document } from "@/app/lib/db/schema";
import useSWR from 'swr';
import { classname, fetcher } from "../../common/utils";
import { useArtifact } from "@/app/hooks/use-artifact";
import { Editor } from "./editor";

interface DocumentPreviewProps {
    isReadonly: boolean;
    result?: any;
    args?: any;
}

function PureDocumentPreview({
    isReadonly,
    result,
    args
}: DocumentPreviewProps) {
    const { artifact, setArtifact } = useArtifact();
    const { data: documents, isLoading: isDocumentsFetching } = useSWR<
        Array<Document>
    >(result ? `/api/document?id=${result.id}` : null, fetcher);

    const previewDocument = useMemo(() => documents?.[0], [documents]);
    const isValidKind = (kind: string): kind is Document["kind"] => {
        return ["code", "image", "text", "sheet"].includes(kind);
    };

    const document: Document | null = previewDocument
        ? previewDocument
        : artifact.status === 'streaming' && isValidKind(artifact.kind)
            ? {
                title: artifact.title,
                kind: artifact.kind,
                content: artifact.content,
                id: artifact.documentId,
                createdAt: new Date(),
                userId: 'noop',
            }
            : null;

    return (
        <div className="relative w-full cursor-pointer">
            {document && <DocumentContent document={document} />}
        </div>
    )
}

export const DocumentPreview = memo(PureDocumentPreview, () => {
    return true;
})

const DocumentContent = ({ document }: { document: Document }) => {
    const { artifact } = useArtifact();

    const containerClassName = classname(
        'h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700',
        {
            'p-4 sm:px-14 sm:py-16': document.kind === 'text',
            'p-0': document.kind === 'code',
        },
    );

    const commonProps = {
        content: document.content ?? '',
        isCurrentVersion: true,
        currentVersionIndex: 0,
        status: artifact.status,
        saveContent: () => { },
        suggestions: [],
    };

    return (
        <div className={containerClassName}>
            {document.kind === 'text' ? (
                <Editor {...commonProps} onSaveContent={() => { }} />
            ) : null}
        </div>
    );
};
