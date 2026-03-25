package com.careerdevelopment.repository;
import com.careerdevelopment.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Job findByJobId(String jobId);
    List<Job> findByCompanyId(Long companyId);
}
