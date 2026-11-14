import { COUNTRIES } from "@/features/user-profile/domain/constants/countries";
import { BIO_MAX } from "@/features/user-profile/domain/constants/validation";
import { FormField } from "../../components/FormField/FormField";
import { SaveStatus } from "../../components/SaveStatus/SaveStatus";
import { SkillsList } from "../../components/SkillsList/SkillsList";
import { useProfileAutosave } from "../../hooks/use-profile-autosave";
import { useUserProfileViewModel } from "../../hooks/use-user-profile-view-model";
import styles from "./UserProfilePage.module.css";

export const UserProfilePage = () => {
  const autosave = useProfileAutosave();
  const {
    values,
    handleTextChange,
    handleCheckboxChange,
    handleBlur,
    handleSubmit,
    getVisibleError,
    updateSkills,
  } = useUserProfileViewModel({ autosave });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <header className={styles.header}>
        <h1>User profile</h1>
        <p>Fill in your details below.</p>
        <SaveStatus autosave={autosave} />
      </header>

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

      <FormField id="phone" label="Phone" error={getVisibleError("phone")}>
        {(controlProps) => (
          <input
            {...controlProps}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 123 4567"
            value={values.phone}
            onChange={handleTextChange}
            onBlur={() => handleBlur("phone")}
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
            value={values.dateOfBirth}
            onChange={handleTextChange}
            onBlur={() => handleBlur("dateOfBirth")}
          />
        )}
      </FormField>

      <div className={styles.checkboxField}>
        <label htmlFor="newsletter">
          <input
            id="newsletter"
            name="newsletter"
            type="checkbox"
            checked={values.newsletter}
            onChange={handleCheckboxChange}
          />
          Subscribe to newsletter
        </label>
      </div>

      <SkillsList skills={values.skills} onSkillsChange={updateSkills} />
    </form>
  );
};
