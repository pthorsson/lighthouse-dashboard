declare module Lhd {
  export type Section = {
    _id: string;
    name: string;
    slug: string;
    weekSchedule?: number[];
    pageGroups?: PageGroup[];
  };

  export type PageGroup = {
    _id: string;
    name: string;
    namePrefix: string;
    nameSuffix: string;
    section?: string;
    pages?: Page[];
  };

  export type Page = {
    _id: string;
    url: string;
    pageGroup?: string;
    audits?: Audit[];
  };

  export type Audit = {
    _id: string;
    timestamp: number;
    duration: number;
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    page?: string;
  };

  export type User = {
    _id: string;
    email: string;
    role: number;
  };

  export type Token = {
    _id: string;
    token: string;
    user: string;
    role: number;
  };
}
