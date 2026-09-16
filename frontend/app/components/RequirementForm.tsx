"use client";

import { useState } from "react";

type Category = "" | "planner" | "performer" | "crew";
type Member = { role: string; quantity: number };

type Details = Record<
  string,
  string | number | boolean | string[] | Member[]
>;

type FormData = {
  eventName: string;
  eventType: string;
  customEventType: string;
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  category: Category;
  categoryDetails: Details;
  additionalRequirements: string;
  specialInstructions: string;
  equipmentRequirements: string;
  setupTimingNotes: string;
  otherPreferences: string;
};

const emptyForm: FormData = {
  eventName: "",
  eventType: "",
  customEventType: "",
  startDate: "",
  endDate: "",
  location: "",
  venue: "",
  category: "",
  categoryDetails: {},
  additionalRequirements: "",
  specialInstructions: "",
  equipmentRequirements: "",
  setupTimingNotes: "",
  otherPreferences: "",
};

const eventTypes = [
  "Concert / Live Music",
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "College / University Event",
  "Festival",
  "Conference / Seminar",
  "Product Launch",
  "Private Party",
  "Cultural Event",
  "Sports Event",
  "Exhibition / Expo",
  "Award Ceremony",
  "Fashion Show",
  "Other",
];

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const label = "block text-sm font-medium text-slate-700";

const options = (items: string[]) =>
  items.map((item) => (
    <option key={item} value={item}>
      {item}
    </option>
  ));

function Field({
  name,
  label: text,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  required = false,
  error,
}: {
  name: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className={label}>
      {text}
      {required && <span className="text-rose-600"> *</span>}

      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        className={input}
        aria-invalid={Boolean(error)}
      />

      {error && (
        <span className="mt-1 block text-xs text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

function Select({
  label: text,
  value,
  onChange,
  choices,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  choices: string[];
  required?: boolean;
  error?: string;
}) {
  return (
    <label className={label}>
      {text}
      {required && <span className="text-rose-600"> *</span>}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={input}
        aria-invalid={Boolean(error)}
      >
        <option value="">Select an option</option>
        {options(choices)}
      </select>

      {error && (
        <span className="mt-1 block text-xs text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default function RequirementForm() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<FormData>(emptyForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState<{
    id: string;
    eventName: string;
    category: string;
  } | null>(null);

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  const changeEventType = (eventType: string) =>
    setForm((prev) => ({
      ...prev,
      eventType,
      customEventType:
        eventType === "Other" ? prev.customEventType : "",
    }));

  const detail = (
    key: string,
    value: string | number | boolean | string[] | Member[]
  ) =>
    setForm((prev) => {
      let categoryDetails: Details;

      // Switching performer branches or types starts fresh,
      // preventing stale fields in the payload.
      if (
        key === "performerMode" &&
        prev.categoryDetails.performerMode !== value
      ) {
        categoryDetails = {
          performerMode: value as string,
        };
      } else if (
        key === "performerType" &&
        prev.categoryDetails.performerType !== value
      ) {
        categoryDetails = {
          performerMode:
            prev.categoryDetails.performerMode as string,
          performerType: value as string,
        };
      } else if (
        key === "crewType" &&
        prev.categoryDetails.crewType !== value
      ) {
        categoryDetails = {
          crewType: value as string,
        };
      } else if (
        key === "performanceStyle" &&
        value !== "Other"
      ) {
        categoryDetails = {
          ...prev.categoryDetails,
          performanceStyle: value,
          otherPerformanceStyle: "",
        };
      } else if (key === "genre" && value !== "Other") {
        categoryDetails = {
          ...prev.categoryDetails,
          genre: value,
          otherGenre: "",
        };
      } else if (
        key === "soundCheckRequired" &&
        !value
      ) {
        categoryDetails = {
          ...prev.categoryDetails,
          soundCheckRequired: false,
          soundCheckTiming: "",
          soundCheckTime: "",
        };
      } else {
        categoryDetails = {
          ...prev.categoryDetails,
          [key]: value,
        };
      }

      return {
        ...prev,
        categoryDetails,
      };
    });

  const changeCategory = (category: Category) => {
    setForm((prev) => ({
      ...prev,
      category,
      categoryDetails: {},
    }));

    setErrors({});
  };

  const validateCurrentStep = (current: number) => {
    const next: Record<string, string> = {};

    if (current === 1) {
      (
        [
          "eventName",
          "eventType",
          "startDate",
          "endDate",
          "location",
          "category",
        ] as const
      ).forEach((key) => {
        if (!form[key]) {
          next[key] = "This field is required.";
        }
      });

      if (
        form.eventType === "Other" &&
        !form.customEventType.trim()
      ) {
        next.customEventType = "This field is required.";
      }

      if (
        form.startDate &&
        form.endDate &&
        form.endDate < form.startDate
      ) {
        next.endDate =
          "End date cannot be before start date.";
      }
    }

    if (current === 2) {
      const d = form.categoryDetails;

      if (
        form.category === "planner" &&
        !d.planningType
      ) {
        next.planningType =
          "Choose a planning type.";
      }

      if (form.category === "performer") {
        if (!d.performerMode) {
          next.performerMode =
            "Choose a performer option.";
        }

        if (
          d.performerMode === "individual" &&
          !d.performerType
        ) {
          next.performerType =
            "Choose a performer type.";
        }

        if (d.performerMode === "band") {
          if (!d.groupName) {
            next.groupName =
              "Group name is required.";
          }

          if (!d.numberOfMembers) {
            next.numberOfMembers =
              "Member count is required.";
          }
        }

        const bandMembers =
          d.members as Member[] | undefined;

        if (
          d.performerMode === "band" &&
          Array.isArray(bandMembers)
        ) {
          if (
            bandMembers.some(
              (member) =>
                !member.role.trim() ||
                member.quantity < 1
            )
          ) {
            next.members =
              "Each role needs a name and a quantity of at least 1.";
          }
        }
      }

      if (form.category === "crew") {
        if (!d.crewType) {
          next.crewType =
            "Choose a crew type.";
        }

        const crewCounts = [
          "numberOfPhotographers",
          "numberOfVideographers",
          "numberOfAudioCrew",
          "numberOfLightingCrew",
          "numberOfStageCrew",
          "numberOfCrewMembers",
          "numberOfSecurityPersonnel",
        ];

        if (
          crewCounts.some(
            (key) =>
              d[key] !== undefined &&
              Number(d[key]) < 1
          )
        ) {
          next.crewCount =
            "Crew counts must be at least 1.";
        }
      }
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  /*
   * IMPORTANT:
   * Navigation and submission are completely separate.
   *
   * Step 1 -> Step 2
   * Step 2 -> Step 3
   * Step 3 -> Step 4
   *
   * This function NEVER calls fetch().
   */
  const goToNextStep = () => {
    if (!validateCurrentStep(step)) {
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      setStep(4);
      return;
    }
  };

  const goToPreviousStep = () => {
    setStep((currentStep) =>
      Math.max(currentStep - 1, 1)
    );
  };

  /*
   * ONLY the final Submit Requirement button
   * calls this function.
   */
  const submitRequirement = async () => {
    // Extra safety: never submit unless we are on Step 4.
    if (step !== 4) {
      return;
    }

    // Validate category details before submission.
    if (!validateCurrentStep(2)) {
      setStep(2);
      return;
    }

    setSubmitting(true);

    const {
      specialInstructions,
      equipmentRequirements,
      setupTimingNotes,
      otherPreferences,
      customEventType,
      ...payload
    } = form;

    if (payload.eventType === "Other") {
      payload.eventType = customEventType.trim();
    }

    payload.additionalRequirements = [
      form.additionalRequirements,
      specialInstructions &&
        `Special instructions: ${specialInstructions}`,
      equipmentRequirements &&
        `Equipment requirements: ${equipmentRequirements}`,
      setupTimingNotes &&
        `Setup / timing notes: ${setupTimingNotes}`,
      otherPreferences &&
        `Other preferences: ${otherPreferences}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace(
          /\/$/,
          ""
        );

      if (!apiBaseUrl) {
        throw new Error(
          "The API URL is not configured."
        );
      }

      const response = await fetch(
        `${apiBaseUrl}/api/requirements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setSuccess({
        id: result.data._id || result.data.id,
        eventName: form.eventName,
        category: form.category,
      });
    } catch {
      setErrors({
        submit:
          "Unable to submit your requirement. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const d = form.categoryDetails;

  const textArea = (
    key: keyof FormData,
    title: string,
    placeholder: string
  ) => (
    <label className={label}>
      {title}

      <textarea
        value={form[key] as string}
        onChange={(e) =>
          update(key, e.target.value)
        }
        className={`${input} min-h-24 resize-y`}
        placeholder={placeholder}
      />
    </label>
  );

  const togglePlannerService = (service: string) =>
    setForm((prev) => {
      const selected = Array.isArray(
        prev.categoryDetails.servicesRequired
      )
        ? (prev.categoryDetails
            .servicesRequired as string[])
        : [];

      const servicesRequired = selected.includes(
        service
      )
        ? selected.filter(
            (item) => item !== service
          )
        : [...selected, service];

      return {
        ...prev,
        categoryDetails: {
          ...prev.categoryDetails,
          servicesRequired,
          ...(servicesRequired.includes("Other")
            ? {}
            : { otherService: "" }),
        },
      };
    });

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <section className="mx-auto mt-20 max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
            ✓
          </div>

          <h1 className="text-2xl font-bold">
            Requirement submitted successfully.
          </h1>

          <p className="mt-3 text-slate-600">
            {success.eventName} · {success.category}
          </p>

          <p className="mt-2 break-all text-sm text-slate-500">
            Requirement ID: {success.id}
          </p>

          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setStep(1);
              setSuccess(null);
              setErrors({});
            }}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white"
          >
            Create Another Requirement
          </button>
        </section>
      </main>
    );
  }

  const steps = [
    "Event Basics",
    "Category Details",
    "Additional Requirements",
    "Review & Submit",
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            GoPratle
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Post an event requirement
          </h1>

          <p className="mt-2 text-slate-600">
            Tell us what your event needs in a few simple steps.
          </p>
        </header>

        <nav
          aria-label="Progress"
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {steps.map((name, index) => (
            <div
              key={name}
              className={`rounded-lg border p-3 text-sm ${
                step === index + 1
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                  : step > index + 1
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <span className="mr-2 font-bold">
                {index + 1}
              </span>
              {name}
            </div>
          ))}
        </nav>

        {/* 
          IMPORTANT:
          This is intentionally NOT using onSubmit.
          The final button calls submitRequirement directly.
        */}
        <form className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
          {step === 1 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                Event basics
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Start with the essential event information.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  name="eventName"
                  label="Event name"
                  value={form.eventName}
                  onChange={(v) =>
                    update("eventName", v)
                  }
                  required
                  error={errors.eventName}
                />

                <Select
                  label="Event type"
                  value={form.eventType}
                  onChange={changeEventType}
                  choices={eventTypes}
                  required
                  error={errors.eventType}
                />

                {form.eventType === "Other" && (
                  <Field
                    name="customEventType"
                    label="Custom Event Type"
                    value={form.customEventType}
                    onChange={(v) =>
                      update("customEventType", v)
                    }
                    placeholder="Enter your event type"
                    required
                    error={errors.customEventType}
                  />
                )}

                <Field
                  name="startDate"
                  label="Start date"
                  type="date"
                  value={form.startDate}
                  onChange={(v) =>
                    update("startDate", v)
                  }
                  required
                  error={errors.startDate}
                />

                <Field
                  name="endDate"
                  label="End date"
                  type="date"
                  value={form.endDate}
                  onChange={(v) =>
                    update("endDate", v)
                  }
                  required
                  error={errors.endDate}
                />

                <Field
                  name="location"
                  label="Location"
                  value={form.location}
                  onChange={(v) =>
                    update("location", v)
                  }
                  required
                  error={errors.location}
                />

                <Field
                  name="venue"
                  label="Venue (optional)"
                  value={form.venue}
                  onChange={(v) =>
                    update("venue", v)
                  }
                />

                <label className={label}>
                  Category{" "}
                  <span className="text-rose-600">
                    *
                  </span>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      changeCategory(
                        e.target.value as Category
                      )
                    }
                    className={input}
                  >
                    <option value="">
                      Select an option
                    </option>

                    <option value="planner">
                      Event Planner
                    </option>

                    <option value="performer">
                      Performer
                    </option>

                    <option value="crew">
                      Crew
                    </option>
                  </select>

                  {errors.category && (
                    <span className="mt-1 block text-xs text-rose-600">
                      {errors.category}
                    </span>
                  )}
                </label>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                Category details
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Add details for your selected{" "}
                {form.category} requirement.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {form.category === "planner" && (
                  <>
                    <Select
                      label="Planning type"
                      value={
                        (d.planningType as string) ||
                        ""
                      }
                      onChange={(v) =>
                        detail("planningType", v)
                      }
                      choices={[
                        "Full Event Planning",
                        "Partial Planning",
                        "Day-of Coordination",
                        "Vendor Management",
                        "Event Logistics",
                        "Other",
                      ]}
                      required
                      error={errors.planningType}
                    />

                    {(d.planningType as string) ===
                      "Other" && (
                      <Field
                        name="otherPlanningType"
                        label="Other planning type"
                        value={
                          (d.otherPlanningType as string) ||
                          ""
                        }
                        onChange={(v) =>
                          detail(
                            "otherPlanningType",
                            v
                          )
                        }
                        placeholder="Enter planning type"
                      />
                    )}

                    <Field
                      name="expectedGuestCount"
                      label="Expected guest count"
                      value={
                        (d.expectedGuestCount as number) ||
                        ""
                      }
                      type="number"
                      min={1}
                      onChange={(value) =>
                        detail(
                          "expectedGuestCount",
                          value ? Number(value) : ""
                        )
                      }
                      error={errors.expectedGuestCount}
                    />

                    <fieldset className="sm:col-span-2">
                      <legend className={label}>
                        Services required
                      </legend>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          "Venue Management",
                          "Vendor Coordination",
                          "Decoration",
                          "Catering Coordination",
                          "Guest Management",
                          "Budget Management",
                          "Guest Experience",
                          "Other",
                        ].map((service) => {
                          const selected = (
                            (d.servicesRequired as string[]) ||
                            []
                          ).includes(service);

                          return (
                            <label
                              key={service}
                              className={`cursor-pointer rounded-full border px-3 py-2 text-sm transition ${
                                selected
                                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                                  : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={selected}
                                onChange={() =>
                                  togglePlannerService(
                                    service
                                  )
                                }
                              />

                              {service}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    {(
                      (d.servicesRequired as string[]) ||
                      []
                    ).includes("Other") && (
                      <Field
                        name="otherService"
                        label="Other service"
                        value={
                          (d.otherService as string) ||
                          ""
                        }
                        onChange={(v) =>
                          detail("otherService", v)
                        }
                        placeholder="Describe the other service"
                      />
                    )}

                    <Select
                      label="Budget range"
                      value={
                        (d.budgetRange as string) || ""
                      }
                      onChange={(v) =>
                        detail("budgetRange", v)
                      }
                      choices={[
                        "Under ₹25,000",
                        "₹25,000 – ₹50,000",
                        "₹50,000 – ₹1,00,000",
                        "₹1,00,000 – ₹2,50,000",
                        "₹2,50,000+",
                        "Flexible / Discuss",
                      ]}
                    />

                    <Select
                      label="Experience preference"
                      value={
                        (d.experiencePreference as string) ||
                        ""
                      }
                      onChange={(v) =>
                        detail(
                          "experiencePreference",
                          v
                        )
                      }
                      choices={[
                        "Any experience",
                        "1+ years",
                        "2+ years",
                        "3+ years",
                        "5+ years",
                        "Professional / Established",
                      ]}
                    />

                    <label
                      className={`${label} sm:col-span-2`}
                    >
                      Additional planner notes

                      <textarea
                        value={
                          (d.plannerNotes as string) || ""
                        }
                        onChange={(e) =>
                          detail(
                            "plannerNotes",
                            e.target.value
                          )
                        }
                        className={`${input} min-h-24`}
                      />
                    </label>
                  </>
                )}

                {form.category === "crew" && (
                  <CrewDetails
                    details={d}
                    detail={detail}
                    errors={errors}
                  />
                )}

                {form.category === "performer" && (
                  <PerformerDetails
                    details={d}
                    detail={detail}
                    errors={errors}
                  />
                )}
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                Additional requirements
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                These optional notes help providers prepare
                for your event.
              </p>

              <div className="mt-6 grid gap-5">
                {textArea(
                  "additionalRequirements",
                  "Additional requirements",
                  "Tell us anything else you need for your event..."
                )}

                {textArea(
                  "specialInstructions",
                  "Special instructions",
                  "Access, guest, or event-specific instructions"
                )}

                {textArea(
                  "equipmentRequirements",
                  "Equipment requirements",
                  "Equipment you need or will provide"
                )}

                {textArea(
                  "setupTimingNotes",
                  "Setup / timing notes",
                  "Setup window, sound check, or arrival time"
                )}

                {textArea(
                  "otherPreferences",
                  "Other preferences",
                  "Optional preferences"
                )}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                Review your requirement
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Check the information below before submitting.
              </p>

              <Review
                title="Event details"
                onEdit={() => setStep(1)}
                data={{
                  "Event name": form.eventName,
                  "Event type":
                    form.eventType === "Other"
                      ? form.customEventType
                      : form.eventType,
                  "Start date": form.startDate,
                  "End date": form.endDate,
                  Location: form.location,
                  Venue: form.venue,
                  Category: form.category,
                }}
              />

              <Review
                title="Category details"
                onEdit={() => setStep(2)}
                data={d}
              />

              <Review
                title="Additional requirements"
                onEdit={() => setStep(3)}
                data={{
                  "Additional requirements":
                    form.additionalRequirements,
                  "Special instructions":
                    form.specialInstructions,
                  "Equipment requirements":
                    form.equipmentRequirements,
                  "Setup / timing notes":
                    form.setupTimingNotes,
                  "Other preferences":
                    form.otherPreferences,
                }}
              />

              {errors.submit && (
                <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                  {errors.submit}
                </p>
              )}
            </section>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
            {step > 1 ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              /*
               * Steps 1, 2 and 3 ONLY navigate.
               * They cannot submit anything.
               */
              <button
                type="button"
                onClick={goToNextStep}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white"
              >
                Continue
              </button>
            ) : (
              /*
               * ONLY Step 4 can submit.
               */
              <button
                type="button"
                onClick={submitRequirement}
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Requirement"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

function PerformerDetails({
  details: d,
  detail,
  errors,
}: {
  details: Details;
  detail: (
    key: string,
    value:
      | string
      | number
      | boolean
      | string[]
      | Member[]
  ) => void;
  errors: Record<string, string>;
}) {
  const mode =
    (d.performerMode as string) || "";

  const members =
    (d.members as Member[]) || [];

  const experienceOptions = [
    "Any experience",
    "1+ years",
    "2+ years",
    "3+ years",
    "5+ years",
    "Professional / Established",
  ];

  const budgetOptions = [
    "Under ₹25,000",
    "₹25,000 – ₹50,000",
    "₹50,000 – ₹1,00,000",
    "₹1,00,000 – ₹2,50,000",
    "₹2,50,000+",
    "Flexible / Discuss",
  ];

  const field = (
    key: string,
    title: string,
    type = "text",
    min?: number
  ) => (
    <Field
      name={key}
      label={title}
      value={
        (d[key] as string | number) || ""
      }
      type={type}
      min={min}
      onChange={(v) =>
        detail(
          key,
          type === "number"
            ? v
              ? Number(v)
              : ""
            : v
        )
      }
      error={errors[key]}
    />
  );

  const select = (
    key: string,
    title: string,
    choices: string[],
    required = false
  ) => (
    <Select
      label={title}
      value={(d[key] as string) || ""}
      onChange={(v) => detail(key, v)}
      choices={choices}
      required={required}
      error={errors[key]}
    />
  );

  const toggle = (
    key: string,
    option: string,
    clearKey?: string
  ) => {
    const selected = Array.isArray(d[key])
      ? (d[key] as string[])
      : [];

    const next = selected.includes(option)
      ? selected.filter(
          (item) => item !== option
        )
      : [...selected, option];

    detail(key, next);

    if (
      option === "Other" &&
      !next.includes("Other") &&
      clearKey
    ) {
      detail(clearKey, "");
    }
  };

  const chips = (
    key: string,
    title: string,
    choices: string[],
    otherKey?: string,
    otherLabel?: string
  ) => (
    <fieldset className="sm:col-span-2">
      <legend className={label}>
        {title}
      </legend>

      <div className="mt-2 flex flex-wrap gap-2">
        {choices.map((choice) => {
          const selected = (
            Array.isArray(d[key])
              ? (d[key] as string[])
              : []
          ).includes(choice);

          return (
            <label
              key={choice}
              className={`cursor-pointer rounded-full border px-3 py-2 text-sm transition ${
                selected
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                  : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selected}
                onChange={() =>
                  toggle(
                    key,
                    choice,
                    otherKey
                  )
                }
              />

              {choice}
            </label>
          );
        })}
      </div>

      {otherKey &&
        (
          Array.isArray(d[key])
            ? (d[key] as string[])
            : []
        ).includes("Other") && (
          <div className="mt-3 max-w-md">
            <Field
              name={otherKey}
              label={
                otherLabel || "Other"
              }
              value={
                (d[otherKey] as string) ||
                ""
              }
              onChange={(v) =>
                detail(otherKey, v)
              }
              placeholder="Enter details"
            />
          </div>
        )}
    </fieldset>
  );

  const modeControl = (
    <label
      className={`${label} sm:col-span-2`}
    >
      What type of performer are you looking for?
      <span className="text-rose-600">
        {" "}
        *
      </span>

      <select
        value={mode}
        onChange={(e) =>
          detail(
            "performerMode",
            e.target.value
          )
        }
        className={input}
        aria-invalid={Boolean(
          errors.performerMode
        )}
      >
        <option value="">
          Select an option
        </option>

        <option value="individual">
          Individual Performer
        </option>

        <option value="band">
          Band / Performance Group
        </option>
      </select>

      {errors.performerMode && (
        <span className="mt-1 block text-xs text-rose-600">
          {errors.performerMode}
        </span>
      )}
    </label>
  );

  if (!mode) {
    return modeControl;
  }

  if (mode === "individual") {
    const type =
      (d.performerType as string) || "";

    const style = (
      <>
        {select(
          "performanceStyle",
          "Performance style",
          [
            "Live",
            "Acoustic",
            "Electronic",
            "Backing Track",
            "Interactive",
            "Other",
          ]
        )}

        {(
          d.performanceStyle as string
        ) === "Other" &&
          field(
            "otherPerformanceStyle",
            "Other performance style"
          )}
      </>
    );

    const genre = (
      <>
        {select(
          "genre",
          "Genre",
          [
            "Pop",
            "Rock",
            "Bollywood",
            "Classical",
            "Jazz",
            "EDM",
            "Hip Hop",
            "Folk",
            "Devotional",
            "Regional",
            "Other",
          ]
        )}

        {(d.genre as string) ===
          "Other" &&
          field(
            "otherGenre",
            "Other genre"
          )}
      </>
    );

    return (
      <>
        {modeControl}

        <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">
            Individual Performer
          </h3>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <label className={label}>
              Performer type
              <span className="text-rose-600">
                {" "}
                *
              </span>

              <select
                value={type}
                onChange={(e) =>
                  detail(
                    "performerType",
                    e.target.value
                  )
                }
                className={input}
                aria-invalid={Boolean(
                  errors.performerType
                )}
              >
                <option value="">
                  Select an option
                </option>

                <option value="dj">
                  DJ
                </option>

                <option value="singer">
                  Singer
                </option>

                <option value="dancer">
                  Dancer
                </option>

                <option value="instrumentalist">
                  Instrumentalist
                </option>

                <option value="comedian">
                  Comedian
                </option>

                <option value="other">
                  Other
                </option>
              </select>

              {errors.performerType && (
                <span className="mt-1 block text-xs text-rose-600">
                  {errors.performerType}
                </span>
              )}
            </label>

            {type === "dj" && (
              <>
                {chips(
                  "djEquipment",
                  "DJ equipment",
                  [
                    "DJ Controller",
                    "Turntables",
                    "Mixer",
                    "Speakers",
                    "Subwoofer",
                    "Microphones",
                    "Lighting",
                    "Other",
                  ],
                  "otherDjEquipment",
                  "Other equipment"
                )}

                {style}

                {field(
                  "setDuration",
                  "Set duration"
                )}
              </>
            )}

            {type === "singer" && (
              <>
                {field(
                  "vocalStyle",
                  "Vocal style"
                )}

                {genre}

                {field(
                  "numberOfSongs",
                  "Number of songs",
                  "number",
                  1
                )}

                {field(
                  "performanceDuration",
                  "Performance duration"
                )}
              </>
            )}

            {type === "dancer" && (
              <>
                {field(
                  "danceStyle",
                  "Dance style"
                )}

                {field(
                  "numberOfDancers",
                  "Number of dancers",
                  "number",
                  1
                )}

                {field(
                  "performanceDuration",
                  "Performance duration"
                )}
              </>
            )}

            {type === "instrumentalist" && (
              <>
                {field(
                  "instrument",
                  "Instrument"
                )}

                {style}

                {genre}

                {field(
                  "performanceDuration",
                  "Performance duration"
                )}
              </>
            )}

            {type === "comedian" && (
              <>
                {field(
                  "comedyStyle",
                  "Comedy style"
                )}

                {field(
                  "setDuration",
                  "Set duration"
                )}
              </>
            )}

            {type === "other" && (
              <>
                {field(
                  "performanceType",
                  "Performance type"
                )}

                {field(
                  "performanceDescription",
                  "Performance description"
                )}

                {field(
                  "performanceDuration",
                  "Performance duration"
                )}
              </>
            )}

            {type && (
              <>
                <Select
                  label="Experience"
                  value={
                    (d.experience as string) ||
                    ""
                  }
                  onChange={(v) =>
                    detail(
                      "experience",
                      v
                    )
                  }
                  choices={
                    experienceOptions
                  }
                />

                <Select
                  label="Budget range"
                  value={
                    (d.budgetRange as string) ||
                    ""
                  }
                  onChange={(v) =>
                    detail(
                      "budgetRange",
                      v
                    )
                  }
                  choices={
                    budgetOptions
                  }
                />
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  const updateMember = (
    index: number,
    key: keyof Member,
    value: string | number
  ) =>
    detail(
      "members",
      members.map(
        (member, memberIndex) =>
          memberIndex === index
            ? {
                ...member,
                [key]: value,
              }
            : member
      )
    );

  return (
    <>
      {modeControl}

      <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">
          Band / Performance Group
        </h3>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {field(
            "groupName",
            "Group / Band Name"
          )}

          {field(
            "numberOfMembers",
            "Number of members",
            "number",
            1
          )}

          {select(
            "performanceStyle",
            "Performance style",
            [
              "Live",
              "Acoustic",
              "Electronic",
              "Backing Track",
              "Interactive",
              "Other",
            ]
          )}

          {(d.performanceStyle as string) ===
            "Other" &&
            field(
              "otherPerformanceStyle",
              "Other performance style"
            )}

          {select(
            "genre",
            "Genre",
            [
              "Pop",
              "Rock",
              "Bollywood",
              "Classical",
              "Jazz",
              "EDM",
              "Hip Hop",
              "Folk",
              "Devotional",
              "Regional",
              "Other",
            ]
          )}

          {(d.genre as string) ===
            "Other" &&
            field(
              "otherGenre",
              "Other genre"
            )}

          {field(
            "performanceDuration",
            "Performance duration"
          )}

          <Select
            label="Experience"
            value={
              (d.experience as string) || ""
            }
            onChange={(v) =>
              detail("experience", v)
            }
            choices={
              experienceOptions
            }
          />

          <Select
            label="Budget range"
            value={
              (d.budgetRange as string) || ""
            }
            onChange={(v) =>
              detail("budgetRange", v)
            }
            choices={budgetOptions}
          />

          {chips(
            "equipmentProvided",
            "Equipment provided",
            [
              "Instruments",
              "Microphones",
              "Speakers",
              "Mixer",
              "Amplifiers",
              "Drum Kit",
              "Lighting",
              "Other",
            ],
            "otherEquipmentProvided",
            "Other equipment provided"
          )}

          {chips(
            "equipmentRequired",
            "Equipment required from organizer",
            [
              "PA System",
              "Speakers",
              "Microphones",
              "Mixer",
              "Monitors",
              "Stage Lighting",
              "Amplifiers",
              "Other",
            ],
            "otherEquipmentRequired",
            "Other equipment required"
          )}
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(
              d.soundCheckRequired
            )}
            onChange={(e) =>
              detail(
                "soundCheckRequired",
                e.target.checked
              )
            }
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />

          Sound check required
        </label>

        {d.soundCheckRequired && (
          <div className="mt-4 max-w-md">
            {field(
              "soundCheckTiming",
              "Preferred sound check timing"
            )}
          </div>
        )}

        <label
          className={`${label} mt-5 block`}
        >
          Stage / setup requirements

          <textarea
            value={
              (d.stageRequirements as string) ||
              ""
            }
            onChange={(e) =>
              detail(
                "stageRequirements",
                e.target.value
              )
            }
            className={`${input} min-h-20`}
          />
        </label>

        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">
              Members / Roles
            </h4>

            <button
              type="button"
              onClick={() =>
                detail("members", [
                  ...members,
                  {
                    role: "",
                    quantity: 1,
                  },
                ])
              }
              className="text-sm font-medium text-indigo-600"
            >
              + Add another role
            </button>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Choose a suggested role or enter a custom one.
          </p>

          {errors.members && (
            <p className="mt-2 text-sm text-rose-600">
              {errors.members}
            </p>
          )}

          <datalist id="member-role-options">
            <option value="Vocalist" />
            <option value="Guitarist" />
            <option value="Bassist" />
            <option value="Drummer" />
            <option value="Keyboardist" />
            <option value="Percussionist" />
            <option value="Violinist" />
          </datalist>

          <div className="mt-3 space-y-2">
            {members.map(
              (member, index) => (
                <div
                  className="flex flex-col gap-2 sm:flex-row"
                  key={index}
                >
                  <input
                    aria-label="Member role"
                    list="member-role-options"
                    className={input}
                    value={member.role}
                    onChange={(e) =>
                      updateMember(
                        index,
                        "role",
                        e.target.value
                      )
                    }
                    placeholder="Role"
                  />

                  <input
                    aria-label="Role quantity"
                    type="number"
                    min="1"
                    className={`${input} sm:w-28`}
                    value={member.quantity}
                    onChange={(e) =>
                      updateMember(
                        index,
                        "quantity",
                        e.target.value
                          ? Number(
                              e.target.value
                            )
                          : 0
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      detail(
                        "members",
                        members.filter(
                          (_, memberIndex) =>
                            memberIndex !==
                            index
                        )
                      )
                    }
                    className="px-3 py-2 text-sm font-medium text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CrewDetails({
  details: d,
  detail,
  errors,
}: {
  details: Details;
  detail: (
    key: string,
    value:
      | string
      | number
      | boolean
      | string[]
      | Member[]
  ) => void;
  errors: Record<string, string>;
}) {
  const type =
    (d.crewType as string) || "";

  const experienceOptions = [
    "Any experience",
    "1+ years",
    "2+ years",
    "3+ years",
    "5+ years",
    "Professional / Established",
  ];

  const budgetOptions = [
    "Under ₹25,000",
    "₹25,000 – ₹50,000",
    "₹50,000 – ₹1,00,000",
    "₹1,00,000 – ₹2,50,000",
    "₹2,50,000+",
    "Flexible / Discuss",
  ];

  const field = (
    key: string,
    title: string,
    fieldType = "text",
    min?: number
  ) => (
    <Field
      name={key}
      label={title}
      value={
        (d[key] as string | number) || ""
      }
      type={fieldType}
      min={min}
      onChange={(value) =>
        detail(
          key,
          fieldType === "number"
            ? value
              ? Number(value)
              : ""
            : value
        )
      }
      error={
        errors[key] ||
        errors.crewCount
      }
    />
  );

  const select = (
    key: string,
    title: string,
    choices: string[],
    otherKey?: string,
    otherLabel?: string
  ) => (
    <>
      <Select
        label={title}
        value={
          (d[key] as string) || ""
        }
        onChange={(value) => {
          detail(key, value);

          if (
            value !== "Other" &&
            otherKey
          ) {
            detail(otherKey, "");
          }
        }}
        choices={choices}
      />

      {otherKey &&
        (d[key] as string) ===
          "Other" &&
        field(
          otherKey,
          otherLabel || "Other"
        )}
    </>
  );

  const chips = (
    key: string,
    title: string,
    choices: string[],
    otherKey?: string
  ) => {
    const selected = Array.isArray(
      d[key]
    )
      ? (d[key] as string[])
      : [];

    return (
      <fieldset className="sm:col-span-2">
        <legend className={label}>
          {title}
        </legend>

        <div className="mt-2 flex flex-wrap gap-2">
          {choices.map((choice) => (
            <label
              key={choice}
              className={`cursor-pointer rounded-full border px-3 py-2 text-sm transition ${
                selected.includes(choice)
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                  : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selected.includes(
                  choice
                )}
                onChange={() => {
                  const next =
                    selected.includes(choice)
                      ? selected.filter(
                          (item) =>
                            item !== choice
                        )
                      : [
                          ...selected,
                          choice,
                        ];

                  detail(key, next);

                  if (
                    choice === "Other" &&
                    !next.includes("Other") &&
                    otherKey
                  ) {
                    detail(
                      otherKey,
                      ""
                    );
                  }
                }}
              />

              {choice}
            </label>
          ))}
        </div>

        {otherKey &&
          selected.includes(
            "Other"
          ) && (
            <div className="mt-3 max-w-md">
              {field(
                otherKey,
                "Other equipment"
              )}
            </div>
          )}
      </fieldset>
    );
  };

  const common = (
    <>
      <Select
        label="Experience"
        value={
          (d.experience as string) ||
          ""
        }
        onChange={(value) =>
          detail(
            "experience",
            value
          )
        }
        choices={
          experienceOptions
        }
      />

      <Select
        label="Budget range"
        value={
          (d.budgetRange as string) ||
          ""
        }
        onChange={(value) =>
          detail(
            "budgetRange",
            value
          )
        }
        choices={
          budgetOptions
        }
      />
    </>
  );

  const typeControl = (
    <label
      className={`${label} sm:col-span-2`}
    >
      Crew type
      <span className="text-rose-600">
        {" "}
        *
      </span>

      <select
        value={type}
        onChange={(e) =>
          detail(
            "crewType",
            e.target.value
          )
        }
        className={input}
        aria-invalid={Boolean(
          errors.crewType
        )}
      >
        <option value="">
          Select an option
        </option>

        <option value="photography">
          Photography
        </option>

        <option value="videography">
          Videography
        </option>

        <option value="sound">
          Sound / Audio
        </option>

        <option value="lighting">
          Lighting
        </option>

        <option value="stage-management">
          Stage Management
        </option>

        <option value="event-support">
          Event Support
        </option>

        <option value="security">
          Security
        </option>

        <option value="other">
          Other
        </option>
      </select>

      {errors.crewType && (
        <span className="mt-1 block text-xs text-rose-600">
          {errors.crewType}
        </span>
      )}
    </label>
  );

  if (!type) {
    return typeControl;
  }

  const content =
    type === "photography" ? (
      <>
        {select(
          "photographyStyle",
          "Photography style",
          [
            "Candid",
            "Traditional",
            "Portrait",
            "Fashion",
            "Event Coverage",
            "Documentary",
            "Other",
          ],
          "otherPhotographyStyle",
          "Other photography style"
        )}

        {field(
          "numberOfPhotographers",
          "Number of photographers",
          "number",
          1
        )}

        {field(
          "hoursRequired",
          "Hours required",
          "number",
          1
        )}

        {chips(
          "photographyEquipment",
          "Equipment required",
          [
            "DSLR / Mirrorless Camera",
            "Multiple Lenses",
            "Flash",
            "Tripod",
            "Gimbal",
            "Lighting",
            "Drone",
            "Other",
          ],
          "otherPhotographyEquipment"
        )}

        {common}
      </>
    ) : type === "videography" ? (
      <>
        {select(
          "videoType",
          "Video type",
          [
            "Event Highlights",
            "Full Event Recording",
            "Wedding Film",
            "Promotional Video",
            "Social Media Content",
            "Live Streaming",
            "Other",
          ],
          "otherVideoType",
          "Other video type"
        )}

        {field(
          "numberOfVideographers",
          "Number of videographers",
          "number",
          1
        )}

        {field(
          "hoursRequired",
          "Hours required",
          "number",
          1
        )}

        <label
          className={`${label} sm:col-span-2`}
        >
          Deliverables

          <textarea
            value={
              (d.deliverables as string) ||
              ""
            }
            onChange={(e) =>
              detail(
                "deliverables",
                e.target.value
              )
            }
            className={`${input} min-h-20`}
            placeholder="Describe the videos or edits you need"
          />
        </label>

        {chips(
          "videographyEquipment",
          "Equipment required",
          [
            "Camera",
            "Multiple Lenses",
            "Gimbal",
            "Tripod",
            "Lighting",
            "Drone",
            "Other",
          ],
          "otherVideographyEquipment"
        )}

        {common}
      </>
    ) : type === "sound" ? (
      <>
        {select(
          "soundRequirement",
          "Sound requirement",
          [
            "Small Venue",
            "Medium Venue",
            "Large Venue",
            "Concert / Live Sound",
            "DJ / Party Sound",
            "Conference / Speech",
            "Other",
          ],
          "otherSoundRequirement",
          "Other sound requirement"
        )}

        {field(
          "numberOfAudioCrew",
          "Number of audio crew",
          "number",
          1
        )}

        {field(
          "setupTime",
          "Setup time"
        )}

        {chips(
          "soundEquipment",
          "Equipment required",
          [
            "PA System",
            "Speakers",
            "Subwoofers",
            "Microphones",
            "Wireless Microphones",
            "Mixing Console",
            "Monitors",
            "Amplifiers",
            "Cables",
            "Other",
          ],
          "otherSoundEquipment"
        )}

        <label className="sm:col-span-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(
              d.soundCheckRequired
            )}
            onChange={(e) =>
              detail(
                "soundCheckRequired",
                e.target.checked
              )
            }
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />

          Sound check required
        </label>

        {d.soundCheckRequired &&
          field(
            "soundCheckTime",
            "Preferred sound check time"
          )}

        {common}
      </>
    ) : type === "lighting" ? (
      <>
        {select(
          "lightingType",
          "Lighting type",
          [
            "Stage Lighting",
            "Ambient Lighting",
            "Concert Lighting",
            "Wedding Lighting",
            "Decorative Lighting",
            "Architectural Lighting",
            "Other",
          ],
          "otherLightingType",
          "Other lighting type"
        )}

        {field(
          "numberOfLightingCrew",
          "Number of lighting crew",
          "number",
          1
        )}

        {field(
          "setupTime",
          "Setup time"
        )}

        {chips(
          "lightingEquipment",
          "Lighting equipment",
          [
            "LED Lights",
            "Spotlights",
            "Moving Heads",
            "PAR Lights",
            "Follow Spot",
            "Control Console",
            "Truss",
            "Other",
          ],
          "otherLightingEquipment"
        )}

        {common}
      </>
    ) : type ===
      "stage-management" ? (
      <>
        {field(
          "numberOfStageCrew",
          "Number of stage crew",
          "number",
          1
        )}

        <label
          className={`${label} sm:col-span-2`}
        >
          Setup requirements

          <textarea
            value={
              (d.setupRequirements as string) ||
              ""
            }
            onChange={(e) =>
              detail(
                "setupRequirements",
                e.target.value
              )
            }
            className={`${input} min-h-20`}
          />
        </label>

        {chips(
          "stageEquipment",
          "Stage equipment",
          [
            "Stage",
            "Risers",
            "Backdrop",
            "Lectern",
            "Chairs",
            "Tables",
            "Stage Barriers",
            "Other",
          ],
          "otherStageEquipment"
        )}

        {field(
          "workingHours",
          "Working hours"
        )}

        {common}
      </>
    ) : type ===
      "event-support" ? (
      <>
        {field(
          "numberOfCrewMembers",
          "Number of crew members",
          "number",
          1
        )}

        {chips(
          "supportResponsibilities",
          "Support responsibilities",
          [
            "Guest Assistance",
            "Registration",
            "Crowd Management",
            "Vendor Coordination",
            "Backstage Support",
            "Logistics",
            "Setup / Teardown",
            "Other",
          ],
          "otherSupportResponsibility"
        )}

        {field(
          "workingHours",
          "Working hours"
        )}

        {field(
          "requiredSkills",
          "Required skills"
        )}

        {field(
          "equipmentRequired",
          "Equipment required"
        )}

        {common}
      </>
    ) : type ===
      "security" ? (
      <>
        {field(
          "numberOfSecurityPersonnel",
          "Number of security personnel",
          "number",
          1
        )}

        {field(
          "workingHours",
          "Working hours"
        )}

        {select(
          "securityType",
          "Security type",
          [
            "Event Security",
            "Entry / Gate Security",
            "Crowd Control",
            "VIP Security",
            "Venue Security",
            "Other",
          ],
          "otherSecurityType",
          "Other security type"
        )}

        <label
          className={`${label} sm:col-span-2`}
        >
          Special requirements

          <textarea
            value={
              (d.specialRequirements as string) ||
              ""
            }
            onChange={(e) =>
              detail(
                "specialRequirements",
                e.target.value
              )
            }
            className={`${input} min-h-20`}
          />
        </label>

        {common}
      </>
    ) : (
      <>
        {field(
          "crewTypeName",
          "Crew type / name"
        )}

        {field(
          "description",
          "Description"
        )}

        {field(
          "numberOfCrewMembers",
          "Number of crew members",
          "number",
          1
        )}

        {field(
          "workingHours",
          "Working hours"
        )}

        {field(
          "requiredSkills",
          "Required skills"
        )}

        {field(
          "equipmentRequired",
          "Equipment required"
        )}

        {common}
      </>
    );

  return (
    <>
      {typeControl}

      <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">
          {type.replace(/-/g, " ")}
        </h3>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {content}
        </div>
      </div>
    </>
  );
}

function Review({
  title,
  data,
  onEdit,
}: {
  title: string;
  data: Record<string, unknown>;
  onEdit: () => void;
}) {
  const entries = Object.entries(
    data
  ).filter(
    ([, value]) =>
      value !== "" &&
      value !== undefined &&
      value !== null &&
      value !== false &&
      (!Array.isArray(value) ||
        value.length > 0)
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="mt-5 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Edit
        </button>
      </div>

      <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {entries.map(
          ([key, value]) => (
            <div key={key}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {key.replace(
                  /([A-Z])/g,
                  " $1"
                )}
              </dt>

              <dd className="mt-1 text-sm text-slate-800">
                {Array.isArray(
                  value
                ) ? (
                  <div className="flex flex-wrap gap-1.5">
                    {value.map(
                      (
                        item,
                        index
                      ) =>
                        typeof item ===
                        "object" ? (
                          <span
                            key={index}
                            className="rounded-full bg-slate-100 px-2.5 py-1"
                          >
                            {
                              (
                                item as Member
                              )
                                .role
                            }{" "}
                            ×{" "}
                            {
                              (
                                item as Member
                              )
                                .quantity
                            }
                          </span>
                        ) : (
                          <span
                            key={index}
                            className="rounded-full bg-slate-100 px-2.5 py-1"
                          >
                            {String(
                              item
                            )}
                          </span>
                        )
                    )}
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">
                    {String(
                      value
                    )}
                  </span>
                )}
              </dd>
            </div>
          )
        )}
      </dl>
    </section>
  );
}