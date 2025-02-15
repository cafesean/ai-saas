declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
  export const useState: typeof React.useState;
  export const useEffect: typeof React.useEffect;
}

declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
    th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
    td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
    h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  }
}

declare module '@/components/ui/input' {
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
  }
  export const Input: React.FC<InputProps>;
}

declare module '@/components/ui/select' {
  export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: Array<{ value: string; label: string }>;
  }
  export const Select: React.FC<SelectProps>;
}

declare module '@/components/ui/button' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
  }
  export const Button: React.FC<ButtonProps>;
} 