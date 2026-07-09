import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Eye, Edit2, Trash2, UserPlus, CheckCircle, 
  Clock, CheckCircle2, AlertCircle, FileSpreadsheet, Download, RefreshCw, X, User, Phone, Mail, MapPin, DollarSign, Building2, MessageSquare, Paperclip
} from 'lucide-react';
import { FreeServiceRequest, Agent } from '../../types';
import { firebaseService } from '../../lib/firebaseService';

interface FreeServiceRequestsPanelProps {
  agents?: Agent[];
}

export default function FreeServiceRequestsPanel({ agents = [] }: FreeServiceRequestsPanelProps) {
  const [requests, setRequests] = useState<FreeServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterService, setFilterService] = useState('All');
  const [filterAdvisor, setFilterAdvisor] = useState('All');

  // Detail & Editing Modal States
  const [selectedRequest, setSelectedRequest] = useState<FreeServiceRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Editing Temp State
  const [editStatus, setEditStatus] = useState<'New' | 'Contacted' | 'In Progress' | 'Completed'>('New');
  const [editAdvisorId, setEditAdvisorId] = useState('');

  // Subscribe to real-time requests from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = firebaseService.subscribeFreeServiceRequests(
      (list) => {
        setRequests(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading free service requests:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe?.();
  }, []);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.phone.includes(searchQuery) ||
                          r.id.includes(searchQuery);
      
      const matchStatus = filterStatus === 'All' || r.status === filterStatus;
      const matchService = filterService === 'All' || r.requestedServiceName === filterService;
      const matchAdvisor = filterAdvisor === 'All' || r.assignedAdvisorId === filterAdvisor;

      return matchSearch && matchStatus && matchService && matchAdvisor;
    });
  }, [requests, searchQuery, filterStatus, filterService, filterAdvisor]);

  // Dynamic filter dropdown items
  const uniqueServices = useMemo(() => {
    const list = new Set<string>();
    requests.forEach(r => { if (r.requestedServiceName) list.add(r.requestedServiceName); });
    return Array.from(list);
  }, [requests]);

  const uniqueAdvisors = useMemo(() => {
    const list = new Map<string, string>();
    requests.forEach(r => {
      if (r.assignedAdvisorId) {
        list.set(r.assignedAdvisorId, r.assignedAdvisorName || 'Advisor');
      }
    });
    return Array.from(list.entries());
  }, [requests]);

  // Actions
  const handleOpenView = (req: FreeServiceRequest) => {
    setSelectedRequest(req);
    setIsViewOpen(true);
  };

  const handleOpenEdit = (req: FreeServiceRequest) => {
    setSelectedRequest(req);
    setEditStatus(req.status);
    setEditAdvisorId(req.assignedAdvisorId || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest) return;

    const assignedAgent = agents.find(a => a.id === editAdvisorId);
    const updatedPayload: FreeServiceRequest = {
      ...selectedRequest,
      status: editStatus,
      assignedAdvisorId: editAdvisorId,
      assignedAdvisorName: assignedAgent ? assignedAgent.name : 'Unassigned'
    };

    try {
      await firebaseService.saveFreeServiceRequest(updatedPayload);
      setIsEditOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error("Failed to save request modifications:", err);
      alert("Failed to save changes.");
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Request record?')) return;
    try {
      await firebaseService.deleteFreeServiceRequest(id);
      if (selectedRequest?.id === id) {
        setIsViewOpen(false);
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error("Failed to delete request record:", err);
    }
  };

  const handleMarkContacted = async (req: FreeServiceRequest) => {
    const updated: FreeServiceRequest = { ...req, status: 'Contacted' };
    await firebaseService.saveFreeServiceRequest(updated);
  };

  const handleMarkCompleted = async (req: FreeServiceRequest) => {
    const updated: FreeServiceRequest = { ...req, status: 'Completed' };
    await firebaseService.saveFreeServiceRequest(updated);
  };

  // Helper to trigger file download of base64 documents
  const downloadBase64File = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRequests.length === 0) return;
    const headers = ['Request ID', 'Customer Name', 'Phone', 'Email', 'Requested Service', 'Submitted Date', 'Status', 'Advisor', 'City', 'Budget', 'Property Type', 'Preferred Location', 'Message'];
    
    const rows = filteredRequests.map(r => [
      r.id,
      r.customerName,
      `'${r.phone}`, // force string format
      r.email,
      r.requestedServiceName,
      r.submittedDate,
      r.status,
      r.assignedAdvisorName || 'Unassigned',
      r.city || 'N/A',
      r.budget || 'N/A',
      r.propertyType || 'N/A',
      r.preferredLocation || 'N/A',
      (r.message || 'N/A').replace(/\n/g, ' ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Campaign_Service_Requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel XML/Tab Separated
  const handleExportExcel = () => {
    if (filteredRequests.length === 0) return;
    
    // Tab-separated values file which Excel opens flawlessly with correct column bounds
    const headers = ['Request ID', 'Customer Name', 'Phone', 'Email', 'Requested Service', 'Submitted Date', 'Status', 'Advisor', 'City', 'Budget', 'Property Type', 'Preferred Location', 'Message'];
    
    const rows = filteredRequests.map(r => [
      r.id,
      r.customerName,
      r.phone,
      r.email,
      r.requestedServiceName,
      r.submittedDate,
      r.status,
      r.assignedAdvisorName || 'Unassigned',
      r.city || 'N/A',
      r.budget || 'N/A',
      r.propertyType || 'N/A',
      r.preferredLocation || 'N/A',
      (r.message || 'N/A').replace(/\t/g, ' ').replace(/\n/g, ' ')
    ]);

    const content = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Campaign_Service_Requests_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans text-left" id="free-service-requests-panel">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Free Service Requests
          </h2>
          <p className="text-xs text-slate-400 font-light">
            Monitor and assign visitor enquiries arriving from dynamic Campaign & Services landing cards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={filteredRequests.length === 0}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={filteredRequests.length === 0}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-900 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters Board */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center shadow-xs">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email or mobile..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-400 placeholder:text-slate-400 transition-all font-light"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none max-w-[120px] truncate"
          >
            <option value="All">All Services</option>
            {uniqueServices.map(svc => (
              <option key={svc} value={svc}>{svc}</option>
            ))}
          </select>

          <select
            value={filterAdvisor}
            onChange={(e) => setFilterAdvisor(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none max-w-[120px] truncate"
          >
            <option value="All">All Advisors</option>
            {uniqueAdvisors.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests table listing */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          <p className="text-xs">Loading requests registry...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center space-y-2 shadow-xs">
          <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-800">No requests found</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
            There are no requests submitted by customers under the selected criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-450 tracking-wider">
                <tr>
                  <th className="p-3.5 pl-4">Request ID</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Contact Coordinates</th>
                  <th className="p-3.5">Requested Service</th>
                  <th className="p-3.5">Assigned Advisor</th>
                  <th className="p-3.5">Submitted Date</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition">
                    {/* ID */}
                    <td className="p-3.5 pl-4 font-mono font-medium text-slate-500">
                      #{req.id.substring(req.id.length - 6)}
                    </td>

                    {/* Customer */}
                    <td className="p-3.5 font-semibold text-slate-800">
                      {req.customerName}
                    </td>

                    {/* Contact */}
                    <td className="p-3.5 space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {req.phone}
                      </div>
                      <div className="flex items-center gap-1 text-slate-450 font-light truncate max-w-[150px]">
                        <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                        {req.email}
                      </div>
                    </td>

                    {/* Requested Service */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {req.requestedServiceName}
                      </span>
                    </td>

                    {/* Advisor */}
                    <td className="p-3.5">
                      {req.assignedAdvisorName && req.assignedAdvisorName !== 'Unassigned' ? (
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <User className="h-3.5 w-3.5 text-[#ff5a3c]" />
                          {req.assignedAdvisorName}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {new Date(req.submittedDate).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-block text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                        req.status === 'New'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : req.status === 'Contacted'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : req.status === 'In Progress'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right pr-4 shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(req)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500"
                          title="View Request Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleOpenEdit(req)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500"
                          title="Assign Advisor & Status"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </button>

                        {req.status === 'New' && (
                          <button
                            onClick={() => handleMarkContacted(req)}
                            className="p-1.5 rounded-lg border border-amber-100 hover:border-amber-200 hover:bg-amber-50 text-amber-600"
                            title="Mark Contacted"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {req.status !== 'Completed' && (
                          <button
                            onClick={() => handleMarkCompleted(req)}
                            className="p-1.5 rounded-lg border border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50 text-emerald-600"
                            title="Mark Completed"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="p-1.5 rounded-lg border border-red-100 hover:border-red-200 hover:bg-red-50 text-red-500"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewOpen && selectedRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-mono font-bold bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-0.5 rounded">
                  Request ID: #{selectedRequest.id.substring(selectedRequest.id.length - 8)}
                </span>
                <h3 className="text-base font-bold text-slate-800 tracking-tight pt-1">
                  Enquiry details
                </h3>
              </div>
              <button 
                onClick={() => { setIsViewOpen(false); setSelectedRequest(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-left">
              
              {/* Core Information Card */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Client Name</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRequest.customerName}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Submitted Date</span>
                  <span className="text-xs text-slate-700 font-mono">{new Date(selectedRequest.submittedDate).toLocaleString()}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Mobile Phone</span>
                  <span className="text-xs font-semibold text-slate-800">{selectedRequest.phone}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Email Address</span>
                  <span className="text-xs text-slate-800 break-all">{selectedRequest.email}</span>
                </div>
              </div>

              {/* Service details */}
              <div className="space-y-3.5 border-b border-slate-100 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Requested Service</span>
                    <span className="text-xs font-semibold text-slate-800 bg-[#ff5a3c]/10 text-[#ff5a3c] border border-[#ff5a3c]/15 px-2 py-0.5 rounded-lg w-fit block">
                      {selectedRequest.requestedServiceName}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Assigned Advisor</span>
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-[#ff5a3c]" />
                      {selectedRequest.assignedAdvisorName || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Optional Dynamic Form Fields */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  {selectedRequest.city && (
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-450 uppercase block">City</span>
                      <span className="font-semibold text-slate-850 flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" />{selectedRequest.city}</span>
                    </div>
                  )}
                  {selectedRequest.budget && (
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-450 uppercase block">Budget</span>
                      <span className="font-semibold text-slate-850 flex items-center gap-1"><DollarSign className="h-3 w-3 text-slate-400" />{selectedRequest.budget}</span>
                    </div>
                  )}
                  {selectedRequest.propertyType && (
                    <div className="space-y-0.5 pt-2">
                      <span className="text-[9px] font-mono text-slate-450 uppercase block">Property Type</span>
                      <span className="font-semibold text-slate-850 flex items-center gap-1"><Building2 className="h-3 w-3 text-slate-400" />{selectedRequest.propertyType}</span>
                    </div>
                  )}
                  {selectedRequest.preferredLocation && (
                    <div className="space-y-0.5 pt-2">
                      <span className="text-[9px] font-mono text-slate-450 uppercase block">Preferred Location</span>
                      <span className="font-semibold text-slate-850 flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" />{selectedRequest.preferredLocation}</span>
                    </div>
                  )}
                </div>

                {selectedRequest.message && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Visitor Message</span>
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed font-light">
                      {selectedRequest.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Uploaded base64 attachments */}
              {((selectedRequest.uploadedDocuments && selectedRequest.uploadedDocuments.length > 0) ||
                (selectedRequest.uploadedImages && selectedRequest.uploadedImages.length > 0)) && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Client Attachments</span>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Documents */}
                    {selectedRequest.uploadedDocuments?.map((docData, idx) => (
                      <button
                        key={`doc-${idx}`}
                        onClick={() => downloadBase64File(docData, `client_document_${idx + 1}.pdf`)}
                        className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 hover:border-[#ff5a3c]/30 rounded-xl text-left transition cursor-pointer"
                      >
                        <Paperclip className="h-4 w-4 text-[#ff5a3c]" />
                        <div className="overflow-hidden">
                          <span className="text-xs font-semibold text-slate-700 block truncate">Document {idx + 1}</span>
                          <span className="text-[9px] text-slate-400 font-mono block">CLICK TO DOWNLOAD</span>
                        </div>
                      </button>
                    ))}

                    {/* Images */}
                    {selectedRequest.uploadedImages?.map((imgData, idx) => (
                      <div key={`img-${idx}`} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                        <img src={imgData} alt="Client upload" className="h-24 w-full object-cover filter brightness-95" />
                        <button
                          onClick={() => downloadBase64File(imgData, `client_image_${idx + 1}.png`)}
                          className="w-full py-1.5 bg-slate-900 text-[9px] text-white font-bold uppercase tracking-wider hover:bg-slate-800 text-center block cursor-pointer"
                        >
                          Download Img
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => handleDeleteRequest(selectedRequest.id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-600 text-xs font-semibold transition cursor-pointer"
              >
                Delete Record
              </button>
              <button
                onClick={() => { setIsViewOpen(false); setSelectedRequest(null); }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN & STATUS MODAL */}
      {isEditOpen && selectedRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Modify request record
              </h3>
              <button 
                onClick={() => { setIsEditOpen(false); setSelectedRequest(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-450">Change Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-450">Assign Advisor</label>
                <select
                  value={editAdvisorId}
                  onChange={(e) => setEditAdvisorId(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="">Unassigned</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name} ({agent.role})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => { setIsEditOpen(false); setSelectedRequest(null); }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#ff5a3c] text-white text-xs font-semibold rounded-xl hover:bg-[#e04326] transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
