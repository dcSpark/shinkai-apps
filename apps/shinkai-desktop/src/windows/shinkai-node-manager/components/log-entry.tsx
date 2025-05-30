import {
  AlertCircle,
  AlertTriangle,
  Bug,
  Circle,
  CircleDot,
  Info,
} from 'lucide-react';

import { type LogEntry } from '../../../lib/shinkai-logs/log-entry';

interface LogEntryProps {
  log: LogEntry;
  onLogClick?: (message: string) => void;
}

export const LogIcon = ({ level }: { level: string }) => {
  const getLogStyle = () => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-500/20 text-red-500';
      case 'WARN':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'INFO':
        return 'bg-blue-500/20 text-blue-500';
      case 'TRACE':
        return 'bg-gray-500/10 text-gray-200';
      case 'DEBUG':
        return 'bg-purple-500/20 text-purple-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <span className={`rounded p-1 ${getLogStyle()}`}>
      {(() => {
        switch (level) {
          case 'ERROR':
            return <AlertCircle className="h-3 w-3" />;
          case 'WARN':
            return <AlertTriangle className="h-3 w-3" />;
          case 'INFO':
            return <Info className="h-3 w-3" />;
          case 'TRACE':
            return <Circle className="h-3 w-3" />;
          case 'DEBUG':
            return <Bug className="h-3 w-3" />;
          default:
            return <CircleDot className="h-3 w-3" />;
        }
      })()}
    </span>
  );
};

export const LogItem = ({ log, onLogClick }: LogEntryProps) => {
  return (
    <div
      className="flex h-full cursor-pointer items-start gap-2"
      onClick={() => onLogClick?.(log.message)}
    >
      <div className="flex h-full w-full min-w-0 items-center gap-1.5">
        <LogIcon level={log.level} />
        <span className="shrink-0 text-white/40">[{log.timestamp}]</span>
        <span className="shrink-0 text-white/40">[{log.target}]</span>
        <div className="flex-1 truncate">{log.message}</div>
      </div>
    </div>
  );
};
