import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHead: React.FC<TableHeadProps> = ({ children, className = '' }) => {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
};

const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => {
  return (
    <tr
      className={`hover:bg-gray-50 transition-colors duration-150 ${className}`}
    >
      {children}
    </tr>
  );
};

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

// Export all components as a single object
export default Object.assign(Table, {
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
});
