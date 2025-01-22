import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Benchmark(Base):
    """
    Model for benchmark indices (e.g., S&P 500, TSX Composite)
    """

    __tablename__ = "benchmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String, unique=True, index=True, nullable=False)  # e.g., ^GSPC
    name = Column(String, nullable=False)  # e.g., "S&P 500"
    currency = Column(String(3), nullable=False)  # ISO 4217 currency code
    description = Column(String, nullable=True)

    # Relationships
    historical_values = relationship("BenchmarkValue", back_populates="benchmark")
    portfolio_benchmarks = relationship(
        "PortfolioBenchmark", back_populates="benchmark"
    )

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )


class BenchmarkValue(Base):
    """
    Model for historical benchmark values
    """

    __tablename__ = "benchmark_values"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    benchmark_id = Column(
        UUID(as_uuid=True), ForeignKey("benchmarks.id"), nullable=False
    )
    date = Column(DateTime, nullable=False)
    value = Column(Numeric(20, 6), nullable=False)

    # Relationships
    benchmark = relationship("Benchmark", back_populates="historical_values")

    # Ensure one value per benchmark per day
    __table_args__ = (
        UniqueConstraint("benchmark_id", "date", name="uix_benchmark_date"),
    )

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )


class PortfolioBenchmark(Base):
    """
    Model for associating benchmarks with accounts and tracking their weights
    """

    __tablename__ = "portfolio_benchmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
    benchmark_id = Column(
        UUID(as_uuid=True), ForeignKey("benchmarks.id"), nullable=False
    )
    weight = Column(Numeric(5, 2), nullable=False)  # Percentage weight (0-100)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)  # Null means currently active

    # Relationships
    account = relationship("Account", back_populates="portfolio_benchmarks")
    benchmark = relationship("Benchmark", back_populates="portfolio_benchmarks")

    # Ensure no overlapping date ranges for same account/benchmark pair
    __table_args__ = (
        UniqueConstraint(
            "account_id",
            "benchmark_id",
            "start_date",
            name="uix_account_benchmark_start",
        ),
    )

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )
