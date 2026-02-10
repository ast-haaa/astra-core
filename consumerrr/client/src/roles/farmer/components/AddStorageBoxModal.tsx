import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, User } from "lucide-react";
import { Button } from "@/roles/farmer/components/ui/button";
import { Card } from "@/roles/farmer/components/ui/card";
import { Input } from "@/roles/farmer/components/ui/input";
import { Textarea } from "@/roles/farmer/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/roles/farmer/components/ui/select";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";
import { useToast } from "@/roles/farmer/hooks/use-toast";
import { useAuth } from "@/roles/farmer/context/AuthContext";

interface Herb {
  id: string;
  name: string;
  category: "leaf" | "root" | "powder" | "mix";
  scientificName?: string;
  notes?: string;
}

interface AddStorageBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBox: (boxData: {
    id: string;
    nameKey: string;
    location: string;
    tempMin: number;
    tempMax: number;
    humidityMin: number;
    humidityMax: number;
    herb: Herb;
    notes?: string;
  }) => void;
  herbs: Herb[];
  onAddHerb: (herb: Herb) => void;
}

export default function AddStorageBoxModal({
  isOpen,
  onClose,
  onAddBox,
  herbs,
  onAddHerb,
}: AddStorageBoxModalProps) {
  const t = useTranslation();
  const { toast } = useToast();
  const { farmer } = useAuth();
  const [step, setStep] = useState<"form" | "addHerb">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [boxId, setBoxId] = useState("");
  const [selectedHerbId, setSelectedHerbId] = useState("");
  const [location, setLocation] = useState("");
  const [tempMin, setTempMin] = useState("20");
  const [tempMax, setTempMax] = useState("26");
  const [humidityMin, setHumidityMin] = useState("55");
  const [humidityMax, setHumidityMax] = useState("75");
  const [notes, setNotes] = useState("");

  const [herbName, setHerbName] = useState("");
  const [herbCategory, setHerbCategory] = useState<"leaf" | "root" | "powder" | "mix">("leaf");
  const [herbScientific, setHerbScientific] = useState("");
  const [herbNotes, setHerbNotes] = useState("");

  const handleAddHerb = () => {
    if (!herbName.trim()) {
      toast({
        title: t("requiredField"),
        description: t("herbName"),
        variant: "destructive",
      });
      return;
    }

    const newHerb: Herb = {
      id: `HERB-${Date.now()}`,
      name: herbName,
      category: herbCategory,
      scientificName: herbScientific || undefined,
      notes: herbNotes || undefined,
    };

    onAddHerb(newHerb);
    setSelectedHerbId(newHerb.id);

    toast({
      title: newHerb.name,
      description: "Added successfully",
    });

    setHerbName("");
    setHerbCategory("leaf");
    setHerbScientific("");
    setHerbNotes("");
    setStep("form");
  };

  const handleSubmit = async () => {
    if (!boxId.trim()) {
      toast({
        title: t("requiredField"),
        description: t("boxHubId"),
        variant: "destructive",
      });
      return;
    }

    if (!selectedHerbId) {
      toast({
        title: t("requiredField"),
        description: t("herbType"),
        variant: "destructive",
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: t("requiredField"),
        description: t("farmStorageLocation"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const selectedHerb = herbs.find((h) => h.id === selectedHerbId);
      if (!selectedHerb) return;

      onAddBox({
        id: boxId,
        nameKey: `customBox_${boxId}`,
        location,
        tempMin: parseInt(tempMin),
        tempMax: parseInt(tempMax),
        humidityMin: parseInt(humidityMin),
        humidityMax: parseInt(humidityMax),
        herb: selectedHerb,
        notes: notes || undefined,
      });

      toast({
        title: t("boxAddedSuccess"),
        description: t("boxAddedSuccessMsg"),
      });

      setIsSubmitting(false);
      resetForm();
      onClose();
    }, 1500);
  };

  const resetForm = () => {
    setBoxId("");
    setSelectedHerbId("");
    setLocation("");
    setTempMin("20");
    setTempMax("26");
    setHumidityMin("55");
    setHumidityMax("75");
    setNotes("");
    setStep("form");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-w-lg mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-background border-b border-card-border rounded-t-3xl">
                <h2 className="text-xl font-bold text-foreground">
                  {step === "form" ? t("addNewStorageBox") : t("addNewHerb")}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover-elevate rounded-lg"
                  data-testid="button-close-modal"
                >
                  <X size={20} className="text-foreground" />
                </button>
              </div>

              <div className="px-5 py-6 space-y-6 pb-8">
                {step === "form" ? (
                  <>
                    <Card className="p-4 rounded-2xl bg-primary/5 border-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <User size={18} className="text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {t("farmer")}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-foreground font-medium">
                          {farmer?.fullName || "Farmer"}
                        </p>
                        <p className="text-muted-foreground">
                          {t("id")}: {farmer?.id?.slice(0, 12) || "N/A"}
                        </p>
                        {farmer?.mobile && (
                          <p className="text-muted-foreground">
                            {t("mobileNumber")}: {farmer.mobile}
                          </p>
                        )}
                      </div>
                    </Card>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("boxHubId")}
                      </label>
                      <Input
                        placeholder={t("scanQrOrEnter")}
                        value={boxId}
                        onChange={(e) => setBoxId(e.target.value)}
                        data-testid="input-box-id"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("herbType")}
                      </label>
                      <div className="flex gap-2">
                        <Select value={selectedHerbId} onValueChange={setSelectedHerbId}>
                          <SelectTrigger data-testid="select-herb-type">
                            <SelectValue placeholder={t("selectState")} />
                          </SelectTrigger>
                          <SelectContent>
                            {herbs.map((herb) => (
                              <SelectItem key={herb.id} value={herb.id}>
                                {herb.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setStep("addHerb")}
                          data-testid="button-add-new-herb"
                        >
                          <Plus size={18} />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("farmStorageLocation")}
                      </label>
                      <Input
                        placeholder="e.g., Greenhouse A, Cold Storage 1"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        data-testid="input-location"
                      />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {t("expectedStorageConditions")}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            {t("temperatureMinMax")}
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={tempMin}
                              onChange={(e) => setTempMin(e.target.value)}
                              data-testid="input-temp-min"
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={tempMax}
                              onChange={(e) => setTempMax(e.target.value)}
                              data-testid="input-temp-max"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            {t("humidityMinMax")}
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={humidityMin}
                              onChange={(e) => setHumidityMin(e.target.value)}
                              data-testid="input-humidity-min"
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={humidityMax}
                              onChange={(e) => setHumidityMax(e.target.value)}
                              data-testid="input-humidity-max"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("notes")}
                      </label>
                      <Textarea
                        placeholder="Any additional notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="resize-none"
                        data-testid="input-notes"
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full"
                      data-testid="button-register-box"
                    >
                      {isSubmitting ? "Registering..." : t("registerActivateBox")}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("herbName")}
                      </label>
                      <Input
                        placeholder="e.g., Tulsi, Ashwagandha"
                        value={herbName}
                        onChange={(e) => setHerbName(e.target.value)}
                        data-testid="input-herb-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("category")}
                      </label>
                      <Select value={herbCategory} onValueChange={(v: any) => setHerbCategory(v)}>
                        <SelectTrigger data-testid="select-herb-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="leaf">{t("categoryLeaf")}</SelectItem>
                          <SelectItem value="root">{t("categoryRoot")}</SelectItem>
                          <SelectItem value="powder">{t("categoryPowder")}</SelectItem>
                          <SelectItem value="mix">{t("categoryMix")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("scientificName")}
                      </label>
                      <Input
                        placeholder="e.g., Ocimum sanctum"
                        value={herbScientific}
                        onChange={(e) => setHerbScientific(e.target.value)}
                        data-testid="input-herb-scientific"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("notes")}
                      </label>
                      <Textarea
                        placeholder="Additional notes..."
                        value={herbNotes}
                        onChange={(e) => setHerbNotes(e.target.value)}
                        className="resize-none"
                        data-testid="input-herb-notes"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep("form")}
                        className="flex-1"
                        data-testid="button-back-to-form"
                      >
                        {t("back")}
                      </Button>
                      <Button onClick={handleAddHerb} className="flex-1" data-testid="button-save-herb">
                        {t("addNewHerb")}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
