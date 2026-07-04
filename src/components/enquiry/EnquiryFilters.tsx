import React, { useState } from 'react';
import { Search, Filter, RefreshCw, X, Calendar, MapPin, Briefcase, User, Layers, Tag } from 'lucide-react';
import { Agent, Property } from '../../types';

interface EnquiryFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  
  filterSource: string;
  setFilterSource: (val: string) => void;
  
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  
  filterAgent: string;
  setFilterAgent: (val: string) => void;
  
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  
  filterDateRange: string;
  setFilterDateRange: (val: string) => void;

  filterProperty: string;
  setFilterProperty: (val: string) => void;

  filterDepartment: string;
  setFilterDepartment: (val: string) => void;

  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  
  customEndDate: string;
  setCustomEndDate: (val: string) => void;

  agents: Agent[];
  properties: Property[];
  departments: string[];
  onClearFilters: () => void;
}

const CRM_CHANNELS = [
  'Contact Form',
  'Gmail Enquiries',
  'Property Enquiry Forms',
  'Custom Requirement Forms',
  'Site Visit Requests',
  'Newsletter Subscribers',
  'WhatsApp',
  'Phone Calls',
  'Walk-in Customers',
  'Facebook Leads',
  'Instagram Leads',
  'LinkedIn Leads',
  'Google Ads',
  'Referral Sources',
  'API Integrations'
];

const ENQUIRY_STATUSES = [
  'New',
  'Assigned',
  'Contacted',
  'Follow-up',
  'Interested',
  'Site Visit Scheduled',
  'Site Visit Completed',
  'Negotiation',
  'Converted to Lead',
  'Converted to Customer',
  'Closed',
  'Lost',
  'Spam',
  'Trash Bin'
];

export default function EnquiryFilters({
  searchQuery,
  setSearchQuery,
  
  filterSource,
  setFilterSource,
  
  filterStatus,
  setFilterStatus,
  
  filterAgent,
  setFilterAgent,
  
  filterPriority,
  setFilterPriority,
  
  filterDateRange,
  setFilterDateRange,

  filterProperty,
  setFilterProperty,

  filterDepartment,
  setFilterDepartment,

  customStartDate,
  setCustomStartDate,
  
  customEndDate,
  setCustomEndDate,

  agents,
  properties,
  departments,
  onClearFilters
}: EnquiryFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4" id="enquiry-filters-engine">
      {/* Search Input and Basic Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search buyer name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:outline-hidden text-xs transition"
          />
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-2 border rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition ${
            showAdvanced 
              ? 'bg-blue-50 border-blue-200 text-blue-600' 
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {(filterSource !== 'All' || filterStatus !== 'All' || filterAgent !== 'All' || 
            filterPriority !== 'All' || filterDateRange !== 'All' || filterProperty !== 'All' || filterDepartment !== 'All') && (
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>

        <button
          onClick={onClearFilters}
          title="Reset Filters"
          className="p-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-slate-700 bg-white cursor-pointer transition flex items-center justify-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Advanced Filters Expandable Grid */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          {/* Dimension 1: Source */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
              <Layers className="w-3 h-3" /> Ingestion Channels
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Ingestions (15 channels)</option>
              {CRM_CHANNELS.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          {/* Dimension 2: Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
              <Tag className="w-3 h-3" /> Pipeline Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Stages</option>
              {ENQUIRY_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Dimension 3: Assigned Agent */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
              <User className="w-3 h-3" /> Assigned Agent
            </label>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Advisors</option>
              <option value="Unassigned">Unassigned Enquiries</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>{ag.name}</option>
              ))}
            </select>
          </div>

          {/* Dimension 4: Priority */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Invariant Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Dimension 5: Property Reference */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Property Matches
            </label>
            <select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Dimension 6: Department */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
              <Layers className="w-3 h-3" /> Allocation Dept
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Dimension 7: Date Range Selection */}
          <div className="space-y-1 col-span-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Ingestion SLA Window
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden flex-1"
              >
                <option value="All">All Ingestions History</option>
                <option value="Today">Recorded Today (24h)</option>
                <option value="7Days">Last 7 Calendar Days</option>
                <option value="30Days">Last 30 Calendar Days</option>
                <option value="Custom">Custom Date Coordinates</option>
              </select>

              {filterDateRange === 'Custom' && (
                <div className="flex gap-1 items-center">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="p-1 border text-[10px] rounded-md focus:outline-hidden bg-slate-50"
                  />
                  <span className="text-[10px] text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="p-1 border text-[10px] rounded-md focus:outline-hidden bg-slate-50"
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
