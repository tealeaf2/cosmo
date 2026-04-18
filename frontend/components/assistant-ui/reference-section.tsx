"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { 
  BookOpen, 
  Link, 
  FileText, 
  Navigation,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  useAuiState,
} from "@assistant-ui/react";
import { useReferences, Reference } from "@/lib/references-context";

export function ReferenceSection() {
  const { references, removeReference, scrollToReference, clearReferences } = useReferences();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['url', 'document', 'file']));

  const messages = useAuiState((s) => s.thread.messages);

  useEffect(() => {
    if (messages.length === 0) {
      clearReferences();
    }
  }, [messages.length, clearReferences]);

  const getIcon = (type: Reference['type']) => {
    switch (type) {
      case 'url': return <Link className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      case 'document': return <BookOpen className="h-4 w-4" />;
      case 'other': return <Navigation className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Reference['type']) => {
    switch (type) {
      case 'url': return 'Links';
      case 'file': return 'Files';
      case 'document': return 'Documents';
      case 'other': return 'Key Terms';
    }
  };

  const filteredReferences = references.filter(ref =>
    ref.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ref.context && ref.context.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const referencesByType = React.useMemo(() => {
    const grouped: Record<Reference['type'], Reference[]> = {
      url: [],
      file: [],
      document: [],
      other: []
    };
    
    filteredReferences
      .filter(ref => ref.type !== 'other')
      .forEach(ref => {
        grouped[ref.type].push(ref);
      });
    
    return grouped;
  }, [filteredReferences]);

  const toggleTypeExpansion = (type: Reference['type']) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleReferenceClick = (ref: Reference) => {
    scrollToReference(ref.messageId);
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (references.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>References</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No references found yet
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>References ({references.length})</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={clearReferences}
            title="Clear all references"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </SidebarGroupLabel>
      
      <SidebarGroupContent>
        {/* Search */}
        <div className="px-2 mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search references..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
        </div>

        <SidebarMenu>
          {(Object.keys(referencesByType) as Reference['type'][]).map(type => {
            const typeReferences = referencesByType[type];
            if (typeReferences.length === 0) return null;
            
            const isExpanded = expandedTypes.has(type);
            
            return (
              <div key={type}>
                {/* Type Header */}
                <SidebarMenuItem>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto hover:bg-accent/50"
                    onClick={() => toggleTypeExpansion(type)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      {getIcon(type)}
                      <span className="text-sm font-medium">
                        {getTypeLabel(type)} ({typeReferences.length})
                      </span>
                    </div>
                  </Button>
                </SidebarMenuItem>

                {/* References List */}
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {typeReferences.map(ref => (
                      <SidebarMenuItem key={ref.id}>
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/30 cursor-pointer group">
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => handleReferenceClick(ref)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">
                                {ref.text}
                              </span>
                              {ref.type === 'url' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openUrl(ref.text);
                                  }}
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {ref.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            onClick={() => removeReference(ref.id)}
                            title="Remove reference"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}