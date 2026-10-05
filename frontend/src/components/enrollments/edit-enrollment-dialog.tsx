import { useState } from "react";
import { PlusCircle, ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/lib/auth-store";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";


export function EditEnrollmentDialog({ course }: { course: Course }) {
  const studentId = useAuthStore((s) => s.studentId);
  const { courses, enrollments, updateEnrollment
  } = useEnrollmentStore();

  const [open, setOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(course.courseId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const myEnrollments = enrollments.filter((e) => e.studentId === studentId);

  const courseOptions = courses
    .filter((c) => !myEnrollments.some((e) => (e.courseId === c.courseId) && c.courseId !== course.courseId))
    .map((c) => ({
      value: c.courseId,
      label: `${c.courseId} — ${c.courseTitle}`,
    }));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setFormCourse(null);
      setServerError(null);
    }
  };
 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!studentId || !formCourse) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await updateEnrollment(studentId, course.courseId, formCourse);
      handleOpenChange(false);
    }
    catch (err) {
      setServerError((err as Error).message);
    }
    finally {
      setSubmitting(false);
    }
  };

  return (
  <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogTrigger render={
      <Button 
        disabled={!studentId}
        variant="ghost"
        size="icon"
        aria-label={`แก้ไขการลงทะเบียน ${course.courseId}`}
        
        />
      }>
      <ArrowRightLeft className="h-4 w-4" />
    </DialogTrigger>
    <DialogContent className="sm:max-w-lg">
      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>แก้ไขการลงทะเบียน</DialogTitle>
        <DialogDescription>
          เปลี่ยนวิชาที่ลงทะเบียนจาก {course.courseId} — {course.courseTitle} เป็นวิชาอื่น
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-1.5">
        <Label htmlFor="formCourse">เปลี่ยนวิชา</Label>
        <Select
          items={courseOptions}
          value={formCourse}
          onValueChange={(v) => setFormCourse(v as string)}
        >
          <SelectTrigger id="formCourse" className="w-full">
            <SelectValue
              placeholder={
                courseOptions.length === 0
                  ? "ลงทะเบียนครบทุกวิชาแล้ว"
                  : "เลือกวิชา"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {courseOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}
      <DialogFooter>
        <Button
          disabled={!formCourse || submitting}
          type="submit"
        >
          <PlusCircle className="h-4 w-4" />
          {submitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)}