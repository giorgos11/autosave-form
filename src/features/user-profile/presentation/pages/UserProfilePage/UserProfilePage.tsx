import { COUNTRIES } from "@/features/user-profile/domain/constants/countries";
import { phonePlaceholderForCountry } from "@/features/user-profile/domain/constants/country-dial-codes";
import { BIO_MAX } from "@/features/user-profile/domain/constants/validation";
import { toLocalIsoDate } from "@/shared/lib/to-local-iso-date";
import { FormField } from "../../components/FormField/FormField";
import { SaveStatus } from "../../components/SaveStatus/SaveStatus";
import { SkillsList } from "../../components/SkillsList/SkillsList";
import { useProfileAutosave } from "../../hooks/use-profile-autosave";
import { useUnsavedChangesWarning } from "../../hooks/use-unsaved-changes-warning";
import { useUserProfileViewModel } from "../../hooks/use-user-profile-view-model";
import styles from "./UserProfilePage.module.css";

export const UserProfilePage = () => {
  const { autosave, initialProfile } = useProfileAutosave();
  const {
    values,
    handleTextChange,
    handleCheckboxChange,
    handleBlur,
    handleSubmit,
    getVisibleError,
    updateSkills,
    replaceProfile,
  } = useUserProfileViewModel({ autosave, initialProfile });

  useUnsavedChangesWarning(autosave);

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1>Profile &amp; account</h1>
          <SaveStatus autosave={autosave} onUseTheirs={replaceProfile} />
        </div>
        <p>Update your details below. Changes save automatically.</p>
      </header>

      <section
        className={styles.panel}
        aria-labelledby="personal-information-heading"
      >
        <header className={styles.panelHeader}>
          <h2 id="personal-information-heading">Personal information</h2>
          <p>Name, contact details, and location.</p>
        </header>

        <div className={styles.panelBody}>
          <FormField
            id="fullName"
            label="Full name"
            required
            error={getVisibleError("fullName")}
          >
            {(controlProps) => (
              <input
                {...controlProps}
                name="fullName"
                type="text"
                autoComplete="name"
                value={values.fullName}
                onChange={handleTextChange}
                onBlur={() => handleBlur("fullName")}
              />
            )}
          </FormField>

          <FormField
            id="email"
            label="Email"
            required
            error={getVisibleError("email")}
          >
            {(controlProps) => (
              <input
                {...controlProps}
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleTextChange}
                onBlur={() => handleBlur("email")}
              />
            )}
          </FormField>

          <FormField
            id="country"
            label="Country"
            required
            error={getVisibleError("country")}
          >
            {(controlProps) => (
              <select
                {...controlProps}
                name="country"
                autoComplete="country-name"
                value={values.country}
                onChange={handleTextChange}
                onBlur={() => handleBlur("country")}
              >
                <option value="">Select a country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField id="phone" label="Phone" error={getVisibleError("phone")}>
            {(controlProps) => (
              <input
                {...controlProps}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={phonePlaceholderForCountry(values.country)}
                value={values.phone}
                onChange={handleTextChange}
                onBlur={() => handleBlur("phone")}
              />
            )}
          </FormField>
        </div>
      </section>

      <section
        className={styles.panel}
        aria-labelledby="profile-preferences-heading"
      >
        <header className={styles.panelHeader}>
          <h2 id="profile-preferences-heading">Profile &amp; preferences</h2>
          <p>Bio, birthday, and newsletter preference.</p>
        </header>

        <div className={styles.panelBody}>
          <FormField
            id="bio"
            label="Bio"
            hint={`${values.bio.length}/${BIO_MAX}`}
            error={getVisibleError("bio")}
          >
            {(controlProps) => (
              <textarea
                {...controlProps}
                name="bio"
                rows={4}
                maxLength={BIO_MAX}
                value={values.bio}
                onChange={handleTextChange}
                onBlur={() => handleBlur("bio")}
              />
            )}
          </FormField>

          <FormField
            id="dateOfBirth"
            label="Date of birth"
            required
            error={getVisibleError("dateOfBirth")}
          >
            {(controlProps) => (
              <input
                {...controlProps}
                name="dateOfBirth"
                type="date"
                max={toLocalIsoDate()}
                value={values.dateOfBirth}
                onChange={handleTextChange}
                onBlur={() => handleBlur("dateOfBirth")}
              />
            )}
          </FormField>

          <div className={styles.preferenceRow}>
            <div className={styles.preferenceCopy}>
              <label htmlFor="newsletter">Newsletter</label>
              <p>Receive occasional product updates.</p>
            </div>
            <input
              id="newsletter"
              className={styles.toggle}
              name="newsletter"
              type="checkbox"
              checked={values.newsletter}
              onChange={handleCheckboxChange}
            />
          </div>
        </div>
      </section>

      <div className={styles.panel}>
        <SkillsList skills={values.skills} onSkillsChange={updateSkills} />
      </div>
    </form>
  );
};
