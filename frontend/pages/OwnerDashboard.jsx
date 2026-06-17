"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Plus, Trash2, Edit2, Check, UserPlus, Eye, X, Save 
} from "lucide-react";
import { pgListings } from "../src/data/pgdata";

const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LIME = "#C7F04A";
const LINE = "rgba(21,23,15,0.12)";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState(pgListings);
  
  // State for inline editing of PG details
  const [editingPgId, setEditingPgId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", address: "", available: 0 });

  // Get Owner Name from the first listing (Mock Auth)
  const ownerName = properties[0]?.ownerName || "Owner";

  // --- PG ACTIONS ---
  const deleteProperty = (id) => {
    if (window.confirm("Are you sure you want to delete this PG?")) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  const startEditingPg = (pg) => {
    setEditingPgId(pg.id);
    setEditFormData({ name: pg.name, address: pg.address, available: pg.available });
  };

  const saveEditingPg = (id) => {
    setProperties(properties.map(pg => 
      pg.id === id ? { ...pg, ...editFormData } : pg
    ));
    setEditingPgId(null);
  };

  // --- TENANT ACTIONS ---
  const toggleRentStatus = (pgId, tenantId) => {
    setProperties(properties.map(pg => {
      if (pg.id === pgId) {
        return {
          ...pg,
          tenants: pg.tenants.map(t => t.id === tenantId ? { ...t, rentPaid: !t.rentPaid } : t)
        };
      }
      return pg;
    }));
  };

  const deleteTenant = (pgId, tenantId) => {
    if (window.confirm("Remove this tenant?")) {
      setProperties(properties.map(pg => {
        if (pg.id === pgId) {
          return { ...pg, tenants: pg.tenants.filter(t => t.id !== tenantId) };
        }
        return pg;
      }));
    }
  };

  // Calculate Total Earnings (Only Paid Rents)
  const totalEarnings = properties.reduce((acc, pg) => {
    const paidTenants = pg.tenants?.filter(t => t.rentPaid).length || 0;
    return acc + (paidTenants * (pg.sharingOptions?.[0]?.rent || 0));
  }, 0);

  return (
    <div className="min-h-screen py-12 md:py-20 px-4 md:px-10 grain" style={{ background: PAPER, color: INK }}>
      <style>{`
        .ff-display { font-family: var(--font-display); }
        .ff-mono { font-family: var(--font-mono); }
        .grain { background-image: radial-gradient(${GREEN}14 0.5px, transparent 0.5px); background-size: 18px 18px; }
      `}</style>

      <div className="max-w-[1200px] mx-auto pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <p className="ff-mono uppercase tracking-[0.15em] text-[0.7rem] text-[#6B6A5C] mb-2">Welcome Back,</p>
            <h1 className="ff-display text-4xl md:text-5xl">{ownerName}</h1>
          </div>
          <button 
            onClick={() => navigate("/add-pg")}
            className="flex items-center justify-center gap-3 px-6 py-3.5 ff-mono uppercase text-[0.75rem] transition-opacity hover:opacity-90 w-full md:w-auto" 
            style={{ background: INK, color: PAPER }}
          >
            <Plus size={16} /> List New PG
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="p-6 md:p-8" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <p className="ff-mono uppercase text-[0.65rem] opacity-60 mb-2">Total Monthly Earnings</p>
            <div className="ff-display text-3xl md:text-4xl text-[#4F7B1E]">₹{totalEarnings.toLocaleString()}</div>
          </div>
          <div className="p-6 md:p-8" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <p className="ff-mono uppercase text-[0.65rem] opacity-60 mb-2">Active Listings</p>
            <div className="ff-display text-3xl md:text-4xl">{properties.length}</div>
          </div>
        </div>

        {/* Listings & Tenant Management */}
        <div className="space-y-10">
          {properties.length === 0 ? (
            <div className="p-10 text-center ff-mono uppercase tracking-[0.1em] text-[#6B6A5C] border-dashed" style={{ border: `1px dashed ${LINE}` }}>
              No properties listed yet.
            </div>
          ) : (
            properties.map((pg) => (
              <div key={pg.id} className="p-5 md:p-10 transition-colors" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
                
                {/* PG Header & Edit Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b" style={{ borderColor: LINE }}>
                  {editingPgId === pg.id ? (
                    <div className="flex-1 space-y-3 w-full">
                      <input 
                        type="text" 
                        value={editFormData.name} 
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full p-3 border outline-none ff-display text-xl" 
                        style={{ borderColor: LINE, background: PAPER }}
                      />
                      <input 
                        type="text" 
                        value={editFormData.address} 
                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                        className="w-full p-2 border outline-none ff-mono text-sm" 
                        style={{ borderColor: LINE, background: PAPER }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="ff-mono text-xs uppercase">Beds Available:</span>
                        <input 
                          type="number" 
                          value={editFormData.available} 
                          onChange={(e) => setEditFormData({...editFormData, available: e.target.value})}
                          className="w-20 p-2 border outline-none ff-mono text-sm" 
                          style={{ borderColor: LINE, background: PAPER }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="ff-display text-2xl md:text-3xl">{pg.name}</h2>
                        <span className="px-2 py-1 rounded-sm ff-mono text-[0.6rem] uppercase tracking-[0.1em] bg-[#EAE8DF] text-[#6B6A5C]">
                          {pg.available} Beds Left
                        </span>
                      </div>
                      <p className="ff-mono text-[0.7rem] uppercase text-[#6B6A5C]">{pg.address}</p>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex gap-2 w-full md:w-auto justify-end">
                    {editingPgId === pg.id ? (
                      <>
                        <button onClick={() => saveEditingPg(pg.id)} className="p-2.5 bg-green-700 text-white"><Save size={16} /></button>
                        <button onClick={() => setEditingPgId(null)} className="p-2.5 bg-gray-200 text-black"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <Link to={`/pg/${pg.id}`} className="p-2.5 border hover:bg-gray-100" style={{ borderColor: LINE }} title="Preview"><Eye size={16} /></Link>
                        <button onClick={() => startEditingPg(pg)} className="p-2.5 border hover:bg-gray-100" style={{ borderColor: LINE }} title="Edit Details"><Edit2 size={16} /></button>
                        <button onClick={() => deleteProperty(pg.id)} className="p-2.5 border hover:bg-red-50 text-red-500" style={{ borderColor: LINE }} title="Delete PG"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Tenant Table (Responsive Wrapper) */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left ff-mono text-[0.8rem] whitespace-nowrap min-w-[600px]">
                    <thead>
                      <tr style={{ color: "#6B6A5C" }}>
                        <th className="pb-4 font-normal">Tenant Name</th>
                        <th className="pb-4 font-normal">Phone</th>
                        <th className="pb-4 font-normal">Room Type</th>
                        <th className="pb-4 font-normal">Rent Status</th>
                        <th className="pb-4 font-normal text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pg.tenants?.length > 0 ? (
                        pg.tenants.map(t => (
                          <tr key={t.id} className="border-t" style={{ borderColor: LINE }}>
                            <td className="py-4 font-bold">{t.name}</td>
                            <td className="py-4 opacity-80">{t.phone}</td>
                            <td className="py-4 opacity-80">{t.roomType}</td>
                            <td className="py-4">
                              <button 
                                onClick={() => toggleRentStatus(pg.id, t.id)}
                                className={`px-3 py-1 text-[0.7rem] uppercase tracking-[0.05em] transition-colors ${t.rentPaid ? "bg-[#C7F04A] text-black" : "bg-red-100 text-red-800"}`}
                              >
                                {t.rentPaid ? "Paid" : "Pending"}
                              </button>
                            </td>
                            <td className="py-4 text-right">
                              <button onClick={() => deleteTenant(pg.id, t.id)} className="p-2 hover:bg-red-50 rounded-full text-red-400 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-[#6B6A5C] italic opacity-60">
                            No tenants added yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <button className="flex items-center gap-2 ff-mono uppercase text-[0.7rem] hover:underline" style={{ color: GREEN }}>
                  <UserPlus size={14} /> Add New Tenant
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}