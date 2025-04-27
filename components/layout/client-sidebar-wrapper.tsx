"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";

export default function ClientSidebarWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />;
}
