import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSampleSchema, type Sample } from "@shared/schema";
import { useUpdateSample } from "@/hooks/use-samples";
import { useRecalls } from "@/hooks/use-recalls";
import { useLanguage } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, QrCode } from "lucide-react";
import { QRScanModal } from "./QRScanModal";

interface EditSampleDialogProps {
  sample: Sample | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const labReportSchema = z.object({
  status: z.string(),
  temperature: z.string().optional(),
  humidity: z.string().optional(),
  testResult: z.string().optional(),
  remarks: z.string().optional(),
  labReportFile: z.instanceof(File).optional().or(z.string()),
});

type LabReportData = z.infer<typeof labReportSchema>;

export function EditSampleDialog({ sample, open, onOpenChange }: EditSampleDialogProps) {
  const { t } = useLanguage();
  const updateSample = useUpdateSample();
  const { data: recalls } = useRecalls();
  const isMobile = useIsMobile();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const isTulsi = sample?.herbName === "Tulsi";
  const [verificationStatus, setVerificationStatus] = useState<"none" | "success" | "failed">("none");
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const isRecalled = sample ? recalls?.some(r => r.batchId === sample.batchId) : false;

  const handleQRClick = () => {
    if (isTulsi) {
      // Tulsi auto-verifies on click
      setVerificationStatus("success");
      return;
    }
    // Open QR modal for other samples
    setQrModalOpen(true);
  };

  const handleQRVerify = (boxId: string, hubId: string) => {
    if (!sample) return;

    // Exact match logic as per prompt
    const isMatch = (boxId && (boxId === sample.boxId || boxId === sample.hubId)) ||
      (hubId && (hubId === sample.hubId || hubId === sample.boxId));

    if (isMatch) {
      setVerificationStatus("success");
    } else {
      setVerificationStatus("failed");
    }
  };

  const form = useForm<LabReportData>({
    resolver: zodResolver(labReportSchema),
    defaultValues: {
      status: "pending",
      temperature: "",
      humidity: "",
      testResult: "",
      remarks: "",
    },
  });

  // Reset form when sample changes
  useEffect(() => {
    if (sample) {
      form.reset({
        status: sample.status,
        temperature: sample.temperature || "",
        humidity: sample.humidity || "",
        testResult: (sample as any).testResult || "",
        remarks: (sample as any).remarks || "",
      });
      setUploadedFile(null);
      setVerificationStatus("none");
      setQrModalOpen(false);
    }
  }, [sample, form, open]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (validTypes.includes(file.type)) {
        setUploadedFile(file);
      }
    }
  };

  const onSubmit = (data: LabReportData) => {
    if (!sample) return;

    updateSample.mutate(
      {
        id: sample.id,
        status: data.status,
        temperature: data.temperature,
        humidity: data.humidity,
        testResult: data.testResult as any,
        remarks: data.remarks,
        labReportUrl: uploadedFile ? `file_${uploadedFile.name}` : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setVerificationStatus("none");
        },
      }
    );
  };

  if (!sample) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-sample-description">
        <DialogHeader>
          <div className="flex justify-between items-start">

            <div className="flex-1">
              <DialogTitle className="font-display text-xl">
                {sample.herbName} - {sample.batchId}
              </DialogTitle>

              <DialogDescription id="edit-sample-description">
                View and edit lab report details for this sample.
              </DialogDescription>

              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <p>Primary Review ✔️</p>
                <p>Secondary Review: Pending</p>
              </div>


              {/* ADD THIS LINE */}


              {sample.boxId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Source Box: {sample.boxId}
                </p>
              )}
            </div>

            {isRecalled && (
              <div className="text-right">
                <div className="inline-flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <span className="text-xs font-semibold text-red-700">
                    {t("status.recalled")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>


        {isRecalled ? (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">{t("status.recalled")} - {t("samples.remarks")}: Moisture exceeded safe limit</p>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-md"
                data-testid="button-close"
              >
                {t("common.close") || "Close"}
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8">
              {/* Hub ID and QR Scan Section */}
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {sample.hubId && (
                        <p className="text-sm font-medium text-foreground">Hub ID: {sample.hubId}</p>
                      )}
                      {sample.boxId && (
                        <p className="text-xs text-muted-foreground">Source Box: {sample.boxId}</p>
                      )}
                    </div>
                    {verificationStatus !== "none" && (
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${verificationStatus === "success"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                        }`}>
                        {verificationStatus === "success" ? (
                          <><span>✔</span> {isTulsi ? "Source Verified (Sensor-based)" : "Source Verified"}</>
                        ) : (
                          <><span>✖</span> Verification Failed</>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleQRClick}
                    disabled={verificationStatus === "success"}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    data-testid="button-scan-qr"
                  >
                    <QrCode className="w-3.5 h-3.5 text-primary" />
                    <span>{verificationStatus === "success" ? "Verified" : "Scan QR to verify source"}</span>
                  </button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("samples.temperature")}</FormLabel>
                    <FormControl>
                      <Input placeholder="24°C" {...field} data-testid="input-temperature" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="humidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("samples.humidity")}</FormLabel>
                    <FormControl>
                      <Input placeholder="45%" {...field} data-testid="input-humidity" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Events Summary</p>
                <p>• Temperature breach detected: Yes</p>
                <p>• Farmer response time: 6 minutes</p>
                <p>• Total exposure duration: 14 minutes</p>
              </div>


              <FormField
                control={form.control}
                name="testResult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("samples.test_result")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-test-result">
                          <SelectValue placeholder={t("samples.test_result")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pass">{t("samples.test_result_pass")}</SelectItem>
                        <SelectItem value="Fail">{t("samples.test_result_fail")}</SelectItem>
                        <SelectItem value="Requires Retest">{t("samples.test_result_retest")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This result directly impacts consumer safety status.
              </p>


              <FormItem>
                <FormLabel>System Reason</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-16 rounded-md bg-slate-50"
                    defaultValue={
                      form.watch("testResult") === "Fail"
                        ? "Exceeded safe moisture threshold"
                        : form.watch("testResult") === "Pass"
                          ? "Within AYUSH moisture and pesticide limits"
                          : ""
                    }

                  />
                </FormControl>
              </FormItem>


              <FormItem className="space-y-2">
                <FormLabel>{t("samples.upload_report")}</FormLabel>
                <div className="bg-white border-2 border-dashed border-green-300 rounded-md p-5 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/20 transition-all focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-200">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="lab-report-upload"
                    data-testid="input-lab-report"
                  />
                  <label htmlFor="lab-report-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-green-100">
                      <Upload className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {t("samples.upload_report")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("samples.upload_format")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {t("samples.upload_hint")}
                    </span>
                  </label>
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("samples.remarks")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("samples.remarks")}
                        className="min-h-24 rounded-md"
                        {...field}
                        data-testid="textarea-remarks"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground mb-3">
                Once submitted, this result becomes immutable and cannot be edited.
              </p>

              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 rounded-md"
                  disabled={updateSample.isPending}
                  data-testid="button-submit-result"
                >
                  {updateSample.isPending ? "Submitting..." : t("samples.submit")}
                </Button>
              </div>
            </form>
          </Form>
        )}

        <QRScanModal
          open={qrModalOpen}
          onOpenChange={setQrModalOpen}
          onVerify={handleQRVerify}
        />

        <p className="text-xs text-muted-foreground text-right mt-4">
          Digitally signed by LAB-0002
        </p>
        <p className="text-[10px] text-muted-foreground text-right">
          Signature recorded on blockchain
        </p>
        <p className="text-[10px] text-muted-foreground text-right">
          Blockchain Tx ID: 0xA92F…E71
        </p>

      </DialogContent>
    </Dialog>
  );
}
