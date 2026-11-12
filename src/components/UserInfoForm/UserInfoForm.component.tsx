import { SkillsList } from "../SkillsList/SkillsList.component";
import { BIO_MAX, COUNTRIES } from "./UserInfoForm.constants";
import styles from "./UserInfoForm.module.css";
import { useUserInfoForm } from "./UserInfoForm.service";

export const UserInfoForm = () => {
  const {
    values,
    errors,
    handleTextChange,
    handleCheckboxChange,
    handleBlur,
    handleSubmit,
    showError,
    handleAddSkill,
    handleRemoveSkill,
    handleMoveSkillUp,
    handleMoveSkillDown,
    handleDragEnd,
    handleSkillNameChange,
  } = useUserInfoForm();

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <header className={styles.header}>
        <h1>User profile</h1>
        <p>Fill in your details below.</p>
      </header>

      <div className={styles.field}>
        <label htmlFor="fullName">
          Full name <span aria-hidden="true">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={values.fullName}
          onChange={handleTextChange}
          onBlur={() => handleBlur("fullName")}
          aria-invalid={showError("fullName")}
          aria-describedby={
            showError("fullName") ? "fullName-error" : undefined
          }
        />
        {showError("fullName") && (
          <p id="fullName-error" className={styles.error} role="alert">
            {errors.fullName}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="email">
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleTextChange}
          onBlur={() => handleBlur("email")}
          aria-invalid={showError("email")}
          aria-describedby={showError("email") ? "email-error" : undefined}
        />
        {showError("email") && (
          <p id="email-error" className={styles.error} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          value={values.phone}
          onChange={handleTextChange}
          onBlur={() => handleBlur("phone")}
          aria-invalid={showError("phone")}
          aria-describedby={showError("phone") ? "phone-error" : undefined}
        />
        {showError("phone") && (
          <p id="phone-error" className={styles.error} role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="country">
          Country <span aria-hidden="true">*</span>
        </label>
        <select
          id="country"
          name="country"
          value={values.country}
          onChange={handleTextChange}
          onBlur={() => handleBlur("country")}
          aria-invalid={showError("country")}
          aria-describedby={showError("country") ? "country-error" : undefined}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {showError("country") && (
          <p id="country-error" className={styles.error} role="alert">
            {errors.country}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="bio">
          Bio
          <span className={styles.hint}>
            {values.bio.length}/{BIO_MAX}
          </span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={BIO_MAX}
          value={values.bio}
          onChange={handleTextChange}
          onBlur={() => handleBlur("bio")}
          aria-invalid={showError("bio")}
          aria-describedby={showError("bio") ? "bio-error" : undefined}
        />
        {showError("bio") && (
          <p id="bio-error" className={styles.error} role="alert">
            {errors.bio}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="dateOfBirth">
          Date of birth <span aria-hidden="true">*</span>
        </label>
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={values.dateOfBirth}
          onChange={handleTextChange}
          onBlur={() => handleBlur("dateOfBirth")}
          aria-invalid={showError("dateOfBirth")}
          aria-describedby={
            showError("dateOfBirth") ? "dateOfBirth-error" : undefined
          }
        />
        {showError("dateOfBirth") && (
          <p id="dateOfBirth-error" className={styles.error} role="alert">
            {errors.dateOfBirth}
          </p>
        )}
      </div>

      <div className={`${styles.field} ${styles.checkboxField}`}>
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

      <SkillsList
        skills={values.skills}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        onMoveSkillUp={handleMoveSkillUp}
        onMoveSkillDown={handleMoveSkillDown}
        onDragEnd={handleDragEnd}
        onSkillNameChange={handleSkillNameChange}
      />
    </form>
  );
};
