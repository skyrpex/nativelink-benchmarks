import type { PropsWithChildren } from "react";

export interface LinkProps {
  href: string;
  target?: string;
}

export const Link = (props: PropsWithChildren<LinkProps>) => (
  <a
    href={props.href}
    target={props.target}
    className="inline-block text-indigo-500 font-semibold underline"
    rel="noreferrer"
  >
    {props.children}
  </a>
);
