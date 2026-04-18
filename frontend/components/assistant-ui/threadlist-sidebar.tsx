import * as React from "react";
import { MessagesSquare } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { MaterialsSection } from "@/components/assistant-ui/materials-section";
import { ReferenceSection } from "@/components/assistant-ui/reference-section";

export function ThreadListSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="aui-sidebar-header mb-2 border-b">
        <div className="aui-sidebar-header-content flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div>
                  <div className="aui-sidebar-header-icon-wrapper flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <MessagesSquare className="aui-sidebar-header-icon size-4" />
                  </div>
                  <div className="aui-sidebar-header-heading mr-6 flex flex-col gap-0.5 leading-none">
                    <span className="aui-sidebar-header-title font-semibold">
                      Cosmo
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2">
        <ThreadList />
        <div className="aui-top-pane min-h-0 flex-1 overflow-auto">
          <MaterialsSection />
        </div>
      </SidebarContent>
      <SidebarRail />

      <SidebarContent className="aui-sidebar-content px-2">
        <div className="aui-bottom-pane min-h-0 flex-1 overflow-auto">
        <ReferenceSection />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
