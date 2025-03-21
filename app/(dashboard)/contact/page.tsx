"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Mail,
  Phone,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { toast } from "sonner";

import { CardTitle } from "@/components/ui/card";
import WebhookStatus from "@/components/ui/WebhookStatus";
import {
  useGetLeadsByWorkspaceQuery,
  useUpdateLeadMutation,
} from "@/lib/store/services/leadsApi";
import { useGetStatusQuery } from "@/lib/store/services/status";
import { useGetTagsQuery } from "@/lib/store/services/tags";
import { useGetActiveWorkspaceQuery } from "@/lib/store/services/workspace";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";

interface Tags {
  id?: string;
  name: string;
  color: string;
}

interface Contact {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  status: { name: string };
  businessInfo?: string;
  tag?: string | string[];
  address?: string;
  sourceId?: string | null;
  is_email_valid?: boolean;
  createdAt: string;
}

const SkeletonTableRow = memo(() => (
  <TableRow className="animate-pulse">
    {Array(7)
      .fill(0)
      .map((_, i) => (
        <TableCell key={i} className="px-2 py-1">
          <div className="h-4 w-full bg-gray-300 rounded" />
        </TableCell>
      ))}
  </TableRow>
));
SkeletonTableRow.displayName = "SkeletonTableRow";

const ContactTableRow = memo(
  ({
    contact,
    selectedHeaders,
    editNameId,
    setEditNameId,
    nameInfo,
    setNameInfo,
    editEmailId,
    setEditEmailId,
    emailInfo,
    setEmailInfo,
    editPhoneId,
    setEditPhoneId,
    phoneInfo,
    setPhoneInfo,
    editEmailValidationId,
    setEditEmailValidationId,
    emailValidation,
    setEmailValidation,
    editInfoId,
    setEditInfoId,
    businessInfo,
    setBusinessInfo,
    openAddress,
    setOpenAddress,
    addressData,
    setAddressData,
    tags,
    selectedTags,
    handleTagChange,
    handleRemoveTag,
    handleUpdate,
    workspaceId,
    toggleRow,
    expandedRow,
  }: any) => (
    <>
      <TableRow
        key={contact.id}
        className="md:hidden flex items-center p-3 justify-between gap-8"
      >
        <div className="flex flex-col gap-2">
          {selectedHeaders.includes("Name") && (
            <div className="font-medium text-[1rem] text-start cursor-pointer">
              {editNameId === contact.id ? (
                <input
                  type="text"
                  placeholder="Enter Name..."
                  className="px-2 py-1 border rounded-md w-full"
                  value={nameInfo}
                  onChange={(e) => setNameInfo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdate(contact.id, { name: nameInfo });
                      setEditNameId(null);
                    } else if (e.key === "Escape") {
                      setEditNameId(null);
                      setNameInfo(contact.name || "");
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className="text-gray-900 dark:text-gray-300"
                  onDoubleClick={() => {
                    setEditNameId(contact.id);
                    setNameInfo(contact.name || "");
                  }}
                >
                  {contact.name || (
                    <span className="text-gray-400 italic">
                      Double-click to add name
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
          {selectedHeaders.includes("Email") && (
            <div className="text-center cursor-pointer">
              {editEmailId === contact.id ? (
                <input
                  type="email"
                  placeholder="Enter Email..."
                  className="px-2 py-1 border rounded-md w-full"
                  value={emailInfo}
                  onChange={(e) => setEmailInfo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdate(contact.id, { email: emailInfo });
                      setEditEmailId(null);
                    } else if (e.key === "Escape") {
                      setEditEmailId(null);
                      setEmailInfo(contact.email || "");
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className="text-gray-600"
                  onDoubleClick={() => {
                    setEditEmailId(contact.id);
                    setEmailInfo(contact.email || "");
                  }}
                >
                  {contact.email || (
                    <span className="text-gray-400 italic">
                      Double-click to add email
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
        <TableCell>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleRow(contact.id)}
            className="h-8 w-8 border-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md"
          >
            {expandedRow === contact.id ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </TableCell>
      </TableRow>

      {expandedRow === contact.id && (
        <TableRow className="md:hidden">
          <TableCell colSpan={2}>
            <div className="p-3 grid grid-cols-2 gap-2">
              {selectedHeaders.includes("Phone") && (
                <div className="cursor-pointer">
                  <span className="text-gray-600">Phone</span>
                  {editPhoneId === contact.id ? (
                    <input
                      type="text"
                      placeholder="Enter Phone..."
                      className="px-2 py-1 border rounded-md w-full"
                      value={phoneInfo}
                      onChange={(e) => setPhoneInfo(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdate(contact.id, { phone: phoneInfo });
                          setEditPhoneId(null);
                        } else if (e.key === "Escape") {
                          setEditPhoneId(null);
                          setPhoneInfo(contact.phone || "");
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="inline-block group relative">
                      <span
                        className="cursor-pointer group-hover:underline"
                        onDoubleClick={() => {
                          setEditPhoneId(contact.id);
                          setPhoneInfo(contact.phone || "");
                        }}
                      >
                        {contact.phone || (
                          <span className="text-gray-400 italic">
                            Double-click to add phone
                          </span>
                        )}
                      </span>
                      {contact.phone && (
                        <div className="absolute left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-white shadow-md rounded-md p-2 w-[140px] border border-gray-200 z-50">
                          <button
                            onClick={() =>
                              window.open(
                                `https://wa.me/${contact.phone}`,
                                "_blank"
                              )
                            }
                            className="flex items-center gap-2 text-sm text-gray-800 hover:text-green-600"
                          >
                            <Send className="h-4 w-4 text-green-500" />
                            WhatsApp
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `tel:${contact.phone}`)
                            }
                            className="flex items-center gap-2 text-sm text-gray-800 hover:text-blue-600 mt-1"
                          >
                            <Phone className="h-4 w-4 text-blue-500" />
                            Call
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {selectedHeaders.includes("Email Validation") && (
                <div className="cursor-pointer">
                  <span className="text-gray-600">Email Validation</span>
                  {editEmailValidationId === contact.id ? (
                    <select
                      className="px-2 py-1 border rounded-md"
                      value={emailValidation ? "true" : "false"}
                      onChange={async (e) => {
                        const newValue = e.target.value === "true";
                        setEmailValidation(newValue);
                        await handleUpdate(contact.id, {
                          is_email_valid: newValue,
                        });
                        setEditEmailValidationId(null);
                      }}
                      autoFocus
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <span
                      onDoubleClick={() => {
                        setEditEmailValidationId(contact.id);
                        setEmailValidation(contact.is_email_valid || false);
                      }}
                      className={`px-2 py-1 text-sm font-semibold rounded ${
                        contact.is_email_valid
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {contact.is_email_valid ? "True" : "False"}
                    </span>
                  )}
                </div>
              )}
              {selectedHeaders.includes("Platform") && (
                <div>
                  <span className="text-gray-600">Platform</span>
                  {contact.sourceId ? (
                    <WebhookStatus
                      sourceId={contact.sourceId}
                      workspaceId={workspaceId}
                    />
                  ) : (
                    <span className="text-gray-500">No Source</span>
                  )}
                </div>
              )}
              {selectedHeaders.includes("Bussiness Info") && (
                <div className="cursor-pointer">
                  <span className="text-gray-600">Business Info</span>
                  {editInfoId === contact.id ? (
                    <input
                      type="text"
                      placeholder="Enter Business Info..."
                      className="px-2 py-1 border rounded-md w-full"
                      value={businessInfo}
                      onChange={(e) => setBusinessInfo(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdate(contact.id, { businessInfo });
                          setEditInfoId(null);
                        } else if (e.key === "Escape") {
                          setEditInfoId(null);
                          setBusinessInfo(contact.businessInfo || "");
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-gray-700 dark:text-gray-300"
                      onDoubleClick={() => {
                        setEditInfoId(contact.id);
                        setBusinessInfo(contact.businessInfo || "");
                      }}
                    >
                      {contact.businessInfo || (
                        <span className="text-gray-400 italic">
                          Double-click to add info
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
              {selectedHeaders.includes("Tag") && (
                <div className="cursor-pointer">
                  <span className="text-gray-600">Tag</span>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(contact.tag) &&
                      contact.tag.map((tag: string) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                        >
                          <div
                            className="h-3 w-3 rounded-lg"
                            style={{
                              backgroundColor:
                                tags.find((t: any) => t.name === tag)?.color ||
                                "#ccc",
                            }}
                          />
                          <span className="text-sm">{tag}</span>
                          <button
                            onClick={() => handleRemoveTag(contact.id, tag)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    <Select
                      onValueChange={(value) =>
                        handleTagChange(contact.id, value)
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <span>+ Add Tag</span>
                      </SelectTrigger>
                      <SelectContent>
                        {tags.map((tag: any) => (
                          <SelectItem key={tag.name} value={tag.name}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {selectedHeaders.includes("Address") && (
                <div className="cursor-pointer relative">
                  <span className="text-gray-600">Address</span>
                  {openAddress === contact.id ? (
                    <div className="absolute left-1/2 -translate-x-1/2 bg-white border shadow-lg rounded-md p-4 w-[300px] z-50">
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full border p-1 rounded"
                          value={addressData.address1}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              address1: e.target.value,
                            })
                          }
                          placeholder="Address 1"
                        />
                        <input
                          type="text"
                          className="w-full border p-1 rounded"
                          value={addressData.address2}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              address2: e.target.value,
                            })
                          }
                          placeholder="Address 2"
                        />
                        <input
                          type="text"
                          className="w-full border p-1 rounded"
                          value={addressData.country}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              country: e.target.value,
                            })
                          }
                          placeholder="Country"
                        />
                        <input
                          type="text"
                          className="w-full border p-1 rounded"
                          value={addressData.zipCode}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              zipCode: e.target.value,
                            })
                          }
                          placeholder="ZIP Code"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="bg-gray-300 px-2 py-1 rounded"
                          onClick={() => setOpenAddress(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => {
                            handleUpdate(contact.id, {
                              address:
                                `${addressData.address1}, ${addressData.address2}, ${addressData.country}, ${addressData.zipCode}`.trim(),
                            });
                            setOpenAddress(null);
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span
                      className="text-gray-700 dark:text-gray-300"
                      onDoubleClick={() => {
                        setOpenAddress(contact.id);
                        setAddressData({
                          address1: contact.address?.split(",")[0] || "",
                          address2:
                            contact.address?.split(",")[1]?.trim() || "",
                          country: contact.address?.split(",")[2]?.trim() || "",
                          zipCode: contact.address?.split(",")[3]?.trim() || "",
                        });
                      }}
                    >
                      {contact.address || (
                        <span className="text-gray-400 italic">
                          Double-click to add address
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}

      <TableRow key={`${contact.id}-desktop`} className="hidden md:table-row">
        {selectedHeaders.map((header: any) => (
          <TableCell key={header} className="text-center cursor-pointer">
            {header === "Name" && (
              <>
                {editNameId === contact.id ? (
                  <input
                    type="text"
                    placeholder="Enter Name..."
                    className="px-2 py-1 border rounded-md w-full"
                    value={nameInfo}
                    onChange={(e) => setNameInfo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdate(contact.id, { name: nameInfo });
                        setEditNameId(null);
                      } else if (e.key === "Escape") {
                        setEditNameId(null);
                        setNameInfo(contact.name || "");
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-gray-700 dark:text-gray-300"
                    onDoubleClick={() => {
                      setEditNameId(contact.id);
                      setNameInfo(contact.name || "");
                    }}
                  >
                    {contact.name || (
                      <span className="text-gray-400 italic">
                        Double-click to add name
                      </span>
                    )}
                  </span>
                )}
              </>
            )}
            {header === "Email" && (
              <div className="relative inline-block group">
                {editEmailId === contact.id ? (
                  <input
                    type="email"
                    placeholder="Enter Email..."
                    className="px-2 py-1 border rounded-md w-full"
                    value={emailInfo}
                    onChange={(e) => setEmailInfo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdate(contact.id, { email: emailInfo });
                        setEditEmailId(null);
                      } else if (e.key === "Escape") {
                        setEditEmailId(null);
                        setEmailInfo(contact.email || "");
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <span
                      className="cursor-pointer group-hover:underline"
                      onDoubleClick={() => {
                        setEditEmailId(contact.id);
                        setEmailInfo(contact.email || "");
                      }}
                    >
                      {contact.email || (
                        <span className="text-gray-400 italic">
                          Double-click to add email
                        </span>
                      )}
                    </span>
                    {contact.email && (
                      <div className="absolute left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-white shadow-md rounded-md p-2 w-[140px] border border-gray-200 z-50">
                        <button
                          onClick={() =>
                            (window.location.href = `mailto:${contact.email}`)
                          }
                          className="flex items-center gap-2 text-sm text-gray-800 hover:text-blue-600"
                        >
                          <Send className="h-4 w-4 text-blue-500" />
                          Send Email
                        </button>
                        <button
                          onClick={() =>
                            window.open(
                              `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`,
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 text-sm text-gray-800 hover:text-red-600 mt-1"
                        >
                          <Mail className="h-4 w-4 text-red-500" />
                          Open in Gmail
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {header === "Phone" && (
              <div className="inline-block group relative">
                {editPhoneId === contact.id ? (
                  <input
                    type="text"
                    placeholder="Enter Phone..."
                    className="px-2 py-1 border rounded-md w-full"
                    value={phoneInfo}
                    onChange={(e) => setPhoneInfo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdate(contact.id, { phone: phoneInfo });
                        setEditPhoneId(null);
                      } else if (e.key === "Escape") {
                        setEditPhoneId(null);
                        setPhoneInfo(contact.phone || "");
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <span
                      className="cursor-pointer group-hover:underline"
                      onDoubleClick={() => {
                        setEditPhoneId(contact.id);
                        setPhoneInfo(contact.phone || "");
                      }}
                    >
                      {contact.phone || (
                        <span className="text-gray-400 italic">
                          Double-click to add phone
                        </span>
                      )}
                    </span>
                    {contact.phone && (
                      <div className="absolute left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-white shadow-md rounded-md p-2 w-[140px] border border-gray-200 z-50">
                        <button
                          onClick={() =>
                            window.open(
                              `https://wa.me/${contact.phone}`,
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 text-sm text-gray-800 hover:text-green-600"
                        >
                          <Send className="h-4 w-4 text-green-500" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `tel:${contact.phone}`)
                          }
                          className="flex items-center gap-2 text-sm text-gray-800 hover:text-blue-600 mt-1"
                        >
                          <Phone className="h-4 w-4 text-blue-500" />
                          Call
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {header === "Email Validation" && (
              <>
                {editEmailValidationId === contact.id ? (
                  <select
                    className="px-2 py-1 border rounded-md"
                    value={emailValidation ? "true" : "false"}
                    onChange={async (e) => {
                      const newValue = e.target.value === "true";
                      setEmailValidation(newValue);
                      await handleUpdate(contact.id, {
                        is_email_valid: newValue,
                      });
                      setEditEmailValidationId(null);
                    }}
                    autoFocus
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <span
                    onDoubleClick={() => {
                      setEditEmailValidationId(contact.id);
                      setEmailValidation(contact.is_email_valid || false);
                    }}
                    className={`px-2 py-1 text-sm font-semibold rounded ${
                      contact.is_email_valid
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {contact.is_email_valid ? "True" : "False"}
                  </span>
                )}
              </>
            )}
            {header === "Platform" && (
              <>
                {contact.sourceId ? (
                  <WebhookStatus
                    sourceId={contact.sourceId}
                    workspaceId={workspaceId}
                  />
                ) : (
                  <span className="text-gray-500">No Source</span>
                )}
              </>
            )}
            {header === "Bussiness Info" && (
              <>
                {editInfoId === contact.id ? (
                  <input
                    type="text"
                    placeholder="Enter Business Info..."
                    className="px-2 py-1 border rounded-md w-full"
                    value={businessInfo}
                    onChange={(e) => setBusinessInfo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdate(contact.id, { businessInfo });
                        setEditInfoId(null);
                      } else if (e.key === "Escape") {
                        setEditInfoId(null);
                        setBusinessInfo(contact.businessInfo || "");
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-gray-700 dark:text-gray-300"
                    onDoubleClick={() => {
                      setEditInfoId(contact.id);
                      setBusinessInfo(contact.businessInfo || "");
                    }}
                  >
                    {contact.businessInfo || (
                      <span className="text-gray-400 italic">
                        Double-click to add info
                      </span>
                    )}
                  </span>
                )}
              </>
            )}
            {header === "Tag" && (
              <div className="flex flex-wrap gap-2">
                {Array.isArray(contact.tag) &&
                  contact.tag.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                    >
                      <div
                        className="h-3 w-3 rounded-lg"
                        style={{
                          backgroundColor:
                            tags.find((t: any) => t.name === tag)?.color ||
                            "#ccc",
                        }}
                      />
                      <span className="text-sm">{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(contact.id, tag)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                <Select
                  onValueChange={(value) => handleTagChange(contact.id, value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <span>+ Add Tag</span>
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag: any) => (
                      <SelectItem key={tag.name} value={tag.name}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {header === "Address" && (
              <div className="relative">
                {openAddress === contact.id ? (
                  <div className="absolute left-1/2 -translate-x-1/2 bg-white border shadow-lg rounded-md p-4 w-[300px] z-50">
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full border p-1 rounded"
                        value={addressData.address1}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            address1: e.target.value,
                          })
                        }
                        placeholder="Address 1"
                      />
                      <input
                        type="text"
                        className="w-full border p-1 rounded"
                        value={addressData.address2}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            address2: e.target.value,
                          })
                        }
                        placeholder="Address 2"
                      />
                      <input
                        type="text"
                        className="w-full border p-1 rounded"
                        value={addressData.country}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            country: e.target.value,
                          })
                        }
                        placeholder="Country"
                      />
                      <input
                        type="text"
                        className="w-full border p-1 rounded"
                        value={addressData.zipCode}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            zipCode: e.target.value,
                          })
                        }
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="bg-gray-300 px-2 py-1 rounded"
                        onClick={() => setOpenAddress(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => {
                          handleUpdate(contact.id, {
                            address:
                              `${addressData.address1}, ${addressData.address2}, ${addressData.country}, ${addressData.zipCode}`.trim(),
                          });
                          setOpenAddress(null);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <span
                    className="text-gray-700 dark:text-gray-300"
                    onDoubleClick={() => {
                      setOpenAddress(contact.id);
                      setAddressData({
                        address1: contact.address?.split(",")[0] || "",
                        address2: contact.address?.split(",")[1]?.trim() || "",
                        country: contact.address?.split(",")[2]?.trim() || "",
                        zipCode: contact.address?.split(",")[3]?.trim() || "",
                      });
                    }}
                  >
                    {contact.address || (
                      <span className="text-gray-400 italic">
                        Double-click to add address
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}
          </TableCell>
        ))}
      </TableRow>
    </>
  )
);
ContactTableRow.displayName = "ContactTableRow";

const ContactPage = memo(() => {
  const router = useRouter();
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );

  const { data: activeWorkspace, isLoading: isLoadingWorkspace } =
    useGetActiveWorkspaceQuery();
  const workspaceId = activeWorkspace?.data?.id;
  const { data: workspaceData, isLoading: isLoadingLeads } =
    useGetLeadsByWorkspaceQuery(
      { workspaceId: workspaceId?.toString() || "" },
      { skip: !workspaceId, pollingInterval: 60000 }
    ) as any;
  const { data: tagsData, isLoading: isLoadingTags } = useGetTagsQuery(
    workspaceId,
    {
      skip: !workspaceId,
    }
  ) as any;
  const { data: statusData, isLoading: isLoadingStatus } = useGetStatusQuery(
    workspaceId,
    { skip: !workspaceId }
  ) as any;
  const [updateLead] = useUpdateLeadMutation();

  const [contacts, setContacts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editNameId, setEditNameId] = useState<string | null>(null);
  const [nameInfo, setNameInfo] = useState("");
  const [editEmailId, setEditEmailId] = useState<string | null>(null);
  const [emailInfo, setEmailInfo] = useState("");
  const [editPhoneId, setEditPhoneId] = useState<string | null>(null);
  const [phoneInfo, setPhoneInfo] = useState("");
  const [editInfoId, setEditInfoId] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState("");
  const [editEmailValidationId, setEditEmailValidationId] = useState<
    string | null
  >(null);
  const [emailValidation, setEmailValidation] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>(
    {}
  );
  const [openAddress, setOpenAddress] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([
    "Name",
    "Email",
    "Phone",
    "Email Validation",
    "Platform",
    "Bussiness Info",
    "Tag",
  ]);
  const [addressData, setAddressData] = useState({
    address1: "",
    address2: "",
    country: "",
    zipCode: "",
  });
  const tableHeaders = [
    "Name",
    "Email",
    "Phone",
    "Email Validation",
    "Platform",
    "Bussiness Info",
    "Tag",
    "Address",
  ];
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    Object.fromEntries(tableHeaders.map((header) => [header, 150]))
  );

  const contactStatuses = useMemo(
    () =>
      new Set(
        Array.isArray(statusData?.data)
          ? statusData.data
              .filter((status: any) => status.count_statistics)
              .map((status: any) => status.name)
          : []
      ),
    [statusData]
  );

  const fetchLeads = useCallback(() => {
    if (!isLoadingLeads && workspaceData?.data) {
      const fetchedLeads = workspaceData.data.map(
        (lead: any, index: number) => ({
          id: lead.id || index + 1,
          name: lead.name || "",
          email: lead.email || "",
          phone: lead.phone || "",
          status: lead.status || { name: "New" },
          businessInfo: lead.businessInfo || "",
          tag: lead.tags || [],
          address: lead.address || "",
          sourceId: lead.lead_source_id || null,
          is_email_valid: lead.is_email_valid || false,
          createdAt: lead.created_at
            ? new Date(lead.created_at).toISOString()
            : new Date().toISOString(),
        })
      );

      const sortedLeads = fetchedLeads.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const qualifiedContacts = sortedLeads.filter((lead: any) =>
        contactStatuses.has(lead.status.name)
      );

      setContacts(qualifiedContacts);
    }
  }, [workspaceData, isLoadingLeads, contactStatuses]);

  useEffect(() => {
    fetchLeads();
    const pollInterval = setInterval(fetchLeads, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchLeads]);

  useEffect(() => {
    if (tagsData?.data) setTags(tagsData.data);
  }, [tagsData]);

  const filteredContacts = useMemo(
    () =>
      contacts.filter((contact) => {
        const searchLower = search.toLowerCase();
        const statusLower = statusFilter.toLowerCase();
        const matchesSearch =
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.phone.includes(searchLower);
        const matchesStatus =
          statusFilter === "all" ||
          contact.status.name.toLowerCase() === statusLower;
        return matchesSearch && matchesStatus;
      }),
    [contacts, search, statusFilter]
  );

  const toggleRow = useCallback((id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const handleUpdate = useCallback(
    async (
      id: string | number,
      updatedData: Partial<{
        name: string;
        email: string;
        phone: string;
        is_email_valid: boolean;
        businessInfo: string;
        tags: string[];
        address: string;
      }>
    ) => {
      if (
        !Object.values(updatedData).some(
          (value) => value !== undefined && value !== ""
        )
      )
        return;

      try {
        await updateLead({ id, leads: updatedData }).unwrap();
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === id ? { ...contact, ...updatedData } : contact
          )
        );
        toast.success("Update successful");
      } catch (error) {
        toast.error("Update failed");
      }
    },
    [updateLead]
  );

  const handleTagChange = useCallback(
    (id: string, value: string) => {
      setSelectedTags((prev) => {
        const currentTags = prev[id] || [];
        const updatedTags = currentTags.includes(value)
          ? currentTags.filter((tag) => tag !== value)
          : [...currentTags, value];
        handleUpdate(id, { tags: updatedTags });
        return { ...prev, [id]: updatedTags };
      });
    },
    [handleUpdate]
  );

  const handleRemoveTag = useCallback(
    (contactId: string, tagToRemove: string) => {
      setSelectedTags((prev) => {
        const updatedTags = (prev[contactId] || []).filter(
          (tag) => tag !== tagToRemove
        );
        handleUpdate(contactId, { tags: updatedTags });
        return { ...prev, [contactId]: updatedTags };
      });
    },
    [handleUpdate]
  );

  const handleResize = useCallback(
    (header: string) =>
      (
        event: React.SyntheticEvent,
        { size }: { size: { width: number; height: number } }
      ) => {
        setColumnWidths((prev) => ({ ...prev, [header]: size.width }));
      },
    []
  );

  const addColumn = useCallback(
    (header: string) => {
      if (!selectedHeaders.includes(header)) {
        setSelectedHeaders((prev) => {
          const insertIndex = tableHeaders.indexOf(header);
          const updatedHeaders = [...prev];
          for (let i = 0; i < prev.length; i++) {
            if (tableHeaders.indexOf(prev[i]) > insertIndex) {
              updatedHeaders.splice(i, 0, header);
              return updatedHeaders;
            }
          }
          return [...updatedHeaders, header];
        });
      }
    },
    [selectedHeaders, tableHeaders]
  );

  const removeColumn = useCallback((header: string) => {
    setSelectedHeaders((prev) => prev.filter((h) => h !== header));
  }, []);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const isLoading = useMemo(
    () =>
      isLoadingWorkspace || isLoadingLeads || isLoadingTags || isLoadingStatus,
    [isLoadingWorkspace, isLoadingLeads, isLoadingTags, isLoadingStatus]
  );

  const containerClassName = useMemo(
    () =>
      `transition-all duration-500 ease-in-out px-4 py-6 ${
        isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"
      } w-auto overflow-hidden`,
    [isCollapsed]
  );

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <div className="w-full rounded-[16px] md:rounded-[4px]">
          <div className="md:bg-white bg-gray-100 dark:bg-gray-800 flex items-center justify-between p-3 md:p-0 animate-pulse">
            <div className="h-6 w-40 bg-gray-300 rounded" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="h-10 w-full md:w-1/3 bg-gray-300 rounded" />
            <div className="h-10 w-full md:w-40 bg-gray-300 rounded" />
          </div>
          <div className="border rounded-lg mt-4 overflow-x-auto">
            <Table>
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  {selectedHeaders.map((header) => (
                    <TableHead key={header} className="px-2 py-1">
                      <div className="h-4 w-20 bg-gray-300 rounded" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <SkeletonTableRow key={i} />
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div className="w-full rounded-[16px] md:rounded-[4px]">
        <div className="md:bg-white bg-gray-100 dark:bg-gray-800 flex items-center justify-between p-3 md:p-0">
          <CardTitle className="text-md md:text-xl lg:text-2xl text-gray-900 dark:text-gray-100">
            Contacts
          </CardTitle>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Array.from(contactStatuses).map((statusName: any) => (
                <SelectItem key={statusName} value={statusName}>
                  {statusName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg mt-4 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="hidden md:table-header-group">
              <TableRow>
                {selectedHeaders.map((header) => (
                  <TableHead
                    key={header}
                    className="text-center font-semibold"
                    style={{ width: columnWidths[header] }}
                  >
                    <Resizable
                      width={columnWidths[header]}
                      height={30}
                      axis="x"
                      resizeHandles={["e"]}
                      onResize={handleResize(header)}
                    >
                      <div className="flex justify-center items-center">
                        <span>{header}</span>
                      </div>
                    </Resizable>
                  </TableHead>
                ))}
                <TableHead className="text-center">
                  <Select onValueChange={addColumn}>
                    <SelectTrigger className="w-[100px]">
                      <Plus className="h-4 w-4" />
                    </SelectTrigger>
                    <SelectContent>
                      {tableHeaders
                        .filter((header) => !selectedHeaders.includes(header))
                        .map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContacts.map((contact) => (
                <ContactTableRow
                  key={contact.id}
                  contact={contact}
                  selectedHeaders={selectedHeaders}
                  editNameId={editNameId}
                  setEditNameId={setEditNameId}
                  nameInfo={nameInfo}
                  setNameInfo={setNameInfo}
                  editEmailId={editEmailId}
                  setEditEmailId={setEditEmailId}
                  emailInfo={emailInfo}
                  setEmailInfo={setEmailInfo}
                  editPhoneId={editPhoneId}
                  setEditPhoneId={setEditPhoneId}
                  phoneInfo={phoneInfo}
                  setPhoneInfo={setPhoneInfo}
                  editEmailValidationId={editEmailValidationId}
                  setEditEmailValidationId={setEditEmailValidationId}
                  emailValidation={emailValidation}
                  setEmailValidation={setEmailValidation}
                  editInfoId={editInfoId}
                  setEditInfoId={setEditInfoId}
                  businessInfo={businessInfo}
                  setBusinessInfo={setBusinessInfo}
                  openAddress={openAddress}
                  setOpenAddress={setOpenAddress}
                  addressData={addressData}
                  setAddressData={setAddressData}
                  tags={tags}
                  selectedTags={selectedTags}
                  handleTagChange={handleTagChange}
                  handleRemoveTag={handleRemoveTag}
                  handleUpdate={handleUpdate}
                  workspaceId={workspaceId || ""}
                  toggleRow={toggleRow}
                  expandedRow={expandedRow}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {contacts.length > 10 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Select
                value={String(itemsPerPage)}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredContacts.length)}{" "}
                of {filteredContacts.length} entries
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    Math.abs(page - currentPage) <= 1 ||
                    page === 1 ||
                    page === totalPages
                )
                .map((page, i, arr) => (
                  <React.Fragment key={page}>
                    {i > 0 && arr[i - 1] !== page - 1 && (
                      <Button variant="outline" size="icon" disabled>
                        ...
                      </Button>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ContactPage.displayName = "ContactPage";

export default ContactPage;
