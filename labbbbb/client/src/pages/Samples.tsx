import { useState } from "react";
import { useSamples } from "@/hooks/use-samples";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { SampleCard, SampleAutoCreationInfo } from "@/components/samples/SampleCard";
import { EditSampleDialog } from "@/components/samples/EditSampleDialog";
import { type Sample } from "@shared/schema";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  
} from "@/components/ui/select";

export default function Samples() {
  const { data: samples, isLoading } = useSamples();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filteredSamples = samples?.filter(sample => {
    const matchesSearch = sample.herbName.toLowerCase().includes(search.toLowerCase()) || 
                          sample.batchId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || sample.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSampleClick = (sample: Sample) => {
    setSelectedSample(sample);
    setEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 md:pb-0 md:pl-64">
      <Navbar />
      
      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-display font-bold">{t("samples.title")}</h1>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search herbs..." 
                className="pl-9 bg-white rounded-xl border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] bg-white rounded-md border-slate-200" data-testid="select-status-filter">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="in_testing">{t("status.in_testing")}</SelectItem>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
                <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
                <SelectItem value="recalled">{t("status.recalled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSamples?.map((sample) => (
                <SampleCard 
                  key={sample.id} 
                  sample={sample} 
                  onClick={() => handleSampleClick(sample)} 
                />
              ))}
              
              {filteredSamples?.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No samples found matching your criteria.
                </div>
              )}
            </div>
            
            {filteredSamples && filteredSamples.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-4 text-center italic opacity-70">
                <i>Samples are automatically created when farmers add storage boxes.</i>
              </p>
            )}
          </>
        )}
      </main>

      <EditSampleDialog 
        sample={selectedSample} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
    </div>
  );
}
