package com.careerdevelopment.repository;
import com.careerdevelopment.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Company findByEmail(String email);
    Company findByCompanyId(String companyId);
}
