'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOrganization } from '@/components/providers/organization-provider';
import { cn } from '@/lib/utils';

interface OrganizationOption {
  id: string;
  name: string;
  slug: string;
}

export function OrganizationSwitcher() {
  const { organization, switchOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const [organizations] = useState<OrganizationOption[]>([
    { id: 'org-1', name: 'Acme Corporation', slug: 'acme-corp' },
    { id: 'org-2', name: 'TechStart Inc', slug: 'techstart' },
    { id: 'org-3', name: 'Global Ventures', slug: 'global-ventures' },
  ]);

  const handleSelect = async (orgId: string) => {
    if (orgId !== organization?.id) {
      await switchOrganization(orgId);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            <span className="truncate">
              {organization?.name || 'Select organization'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Switch Organization</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandEmpty>No organization found.</CommandEmpty>
          <CommandGroup>
            {organizations.map((org) => (
              <CommandItem
                key={org.id}
                value={org.id}
                onSelect={() => handleSelect(org.id)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    organization?.id === org.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-sm text-muted-foreground">{org.slug}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </DialogContent>
    </Dialog>
  );
}