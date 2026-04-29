/**
 * File: frontend/src/components/admin/DocumentCard.jsx
 * Purpose: Renders one document entry in the admin document list.
 *          Shows filename, size, index status, upload date, delete button.
 * Props:
 *   doc: Document object from Spring Boot
 *   onDelete: (id: number, name: string) => void
 */

import { FileText, Trash2, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { formatSize, formatDate, timeAgo } from '../../utils/helpers';
import { StatusPill } from '../shared/StatusBadge';

export default function DocumentCard({ doc, onDelete }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600/50 transition-all group">

      {/* File icon */}
      <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-red-400" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate" title={doc.originalFilename}>
          {doc.originalFilename}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{formatSize(doc.fileSizeBytes)}</span>
          <span className="text-slate-700">·</span>
          <span className="text-xs text-slate-500" title={doc.uploadedAt}>
            {timeAgo(doc.uploadedAt)}
          </span>
        </div>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {doc.indexed ? (
          <StatusPill variant="success">
            <CheckCircle className="w-3 h-3" />
            Indexed
          </StatusPill>
        ) : (
          <StatusPill variant="warning">
            <Clock className="w-3 h-3" />
            Pending
          </StatusPill>
        )}

        <button
          onClick={() => onDelete(doc.id, doc.originalFilename)}
          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          title={`Delete ${doc.originalFilename}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
