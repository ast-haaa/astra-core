import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Herb {
  id: string;
  herbName: string;
  category: string;
  addedBy: string;
  labId: string;
  status: string;
  notes?: string;
}

const addHerbSchema = z.object({
  herbName: z.string().min(1, "Herb name is required"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
});

type AddHerbForm = z.infer<typeof addHerbSchema>;

export default function ManageHerbs() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [herbs, setHerbs] = useState<Herb[]>(() => {
    const saved = localStorage.getItem("herbtrace-herbs");
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: "1",
        herbName: "Tulsi",
        category: "Leaf",
        addedBy: user?.name || "Lab",
        labId: user?.uniqueId || "LAB001",
        status: "Active",
        notes: "High quality leaf samples",
      },
      {
        id: "2",
        herbName: "Ashwagandha",
        category: "Root",
        addedBy: user?.name || "Lab",
        labId: user?.uniqueId || "LAB001",
        status: "Active",
      },
    ];
  });

  const form = useForm<AddHerbForm>({
    resolver: zodResolver(addHerbSchema),
    defaultValues: {
      herbName: "",
      category: "",
      notes: "",
    },
  });

  const onSubmit = (data: AddHerbForm) => {
    const newHerb: Herb = {
      id: String(herbs.length + 1),
      herbName: data.herbName,
      category: data.category,
      addedBy: user?.name || "Lab",
      labId: user?.uniqueId || "LAB001",
      status: "Active",
      notes: data.notes,
    };

    const updatedHerbs = [...herbs, newHerb];
    setHerbs(updatedHerbs);
    localStorage.setItem("herbtrace-herbs", JSON.stringify(updatedHerbs));
    form.reset();
    setShowDialog(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 md:pb-0 md:pl-64">
      <Navbar />

      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold">{t("herbs.title")}</h1>
          <Button
            onClick={() => setShowDialog(true)}
            className="gap-2"
            data-testid="button-add-herb"
          >
            <Plus className="w-4 h-4" />
            {t("herbs.add_new")}
          </Button>
        </div>

        {/* Herb List */}
        <div className="space-y-3">
          {herbs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("herbs.no_herbs")}</p>
            </div>
          ) : (
            herbs.map((herb) => (
              <Card
                key={herb.id}
                className="p-6 hover-elevate transition-all border border-slate-100"
                data-testid={`card-herb-${herb.id}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {herb.herbName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("herbs.category")}: {herb.category}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium dark:bg-green-900/20 dark:text-green-400">
                      {herb.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {t("herbs.added_by")}
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {herb.addedBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {t("herbs.lab_id")}
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {herb.labId}
                      </p>
                    </div>
                  </div>

                  {herb.notes && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Lab Observation Summary
                      </p>

                      <p className="text-sm text-foreground mt-1">{herb.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Add Herb Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("herbs.add_new_herb")}</DialogTitle>
            <DialogDescription>{t("herbs.add_herb_description")}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Lab Name - Read Only */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("herbs.lab_name")}
                </label>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-foreground">
                  {user.name}
                </div>
              </div>

              {/* Lab ID - Read Only */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("herbs.lab_id")}
                </label>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-foreground">
                  {user.uniqueId || "N/A"}
                </div>
              </div>

              {/* Herb Name */}
              <FormField
                control={form.control}
                name="herbName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("herbs.herb_name")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("herbs.herb_name_placeholder")}
                        {...field}
                        data-testid="input-herb-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("herbs.category")} *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue
                            placeholder={t("herbs.select_category")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Leaf">Leaf</SelectItem>
                        <SelectItem value="Root">Root</SelectItem>
                        <SelectItem value="Mix">Mix</SelectItem>
                        <SelectItem value="Powder">Powder</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Observation Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("herbs.notes_placeholder")}
                        {...field}
                        className="resize-none"
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  data-testid="button-cancel"
                  className="flex-1"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  data-testid="button-save-herb"
                  className="flex-1"
                >
                  {t("herbs.save_herb")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
