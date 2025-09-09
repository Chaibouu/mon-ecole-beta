"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, GraduationCap, BookOpen, Heart } from "lucide-react";
import { MemberForm } from "./member-form";
import { MembersTable } from "./members-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SchoolMembersTabsProps {
  schoolId: string;
  initialMembers: any[];
}

type MemberType = "admin" | "teacher" | "parent" | "student";

const memberTabs = [
  { id: "admin" as MemberType, label: "Administrateurs", icon: Users, color: "bg-red-100 text-red-800" },
  { id: "teacher" as MemberType, label: "Enseignants", icon: GraduationCap, color: "bg-blue-100 text-blue-800" },
  { id: "student" as MemberType, label: "Élèves", icon: BookOpen, color: "bg-green-100 text-green-800" },
  { id: "parent" as MemberType, label: "Parents", icon: Heart, color: "bg-purple-100 text-purple-800" },
];

export function SchoolMembersTabs({ schoolId, initialMembers }: SchoolMembersTabsProps) {
  const [activeTab, setActiveTab] = useState<MemberType>("admin");
  const [members, setMembers] = useState(initialMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredMembers = (members || []).filter((member) => {
    const role = (member?.role || "").toString().toLowerCase();
    return role === activeTab;
  });

  const handleMemberAdded = (newMember: any) => {
    // Toujours raffraîchir via router.refresh (déjà fait dans MemberForm)
    // Pour garantir que la table reflète le nouveau membre immédiatement, on merge prudemment
    const maybe = newMember?.userSchool || newMember?.member || null;
    if (maybe) {
      setMembers((prev) => [...prev, maybe]);
    }
    setIsDialogOpen(false);
  };

  const handleRefresh = () => {
    // Rafraîchir la page pour récupérer les données à jour
    window.location.reload();
  };

  const getTabContent = () => {
    const currentTab = memberTabs.find((tab) => tab.id === activeTab);
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            {currentTab && <currentTab.icon className="h-5 w-5" />}
            <CardTitle className="text-xl">{currentTab?.label}</CardTitle>
            <Badge variant="secondary" className={currentTab?.color}>
              {filteredMembers.length}
            </Badge>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter {activeTab === "admin" ? "un admin" : 
                         activeTab === "teacher" ? "un enseignant" :
                         activeTab === "student" ? "un élève" : "un parent"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Ajouter {activeTab === "admin" ? "un administrateur" : 
                          activeTab === "teacher" ? "un enseignant" :
                          activeTab === "student" ? "un élève" : "un parent"}
                </DialogTitle>
              </DialogHeader>
              <MemberForm
                schoolId={schoolId}
                memberType={activeTab}
                onSuccess={handleMemberAdded}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4">
              <MembersTable 
                members={filteredMembers} 
                memberType={activeTab} 
                schoolId={schoolId}
                onRefresh={handleRefresh}
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {memberTabs.map((tab) => {
          const Icon = tab.icon;
          const tabMembers = members.filter(
            (member) => member.role.toLowerCase() === tab.id
          );
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <Badge variant="secondary" className="ml-1">
                {tabMembers.length}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {getTabContent()}
    </div>
  );
}
