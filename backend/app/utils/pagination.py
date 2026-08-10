from fastapi import Query


class PaginationParams:
    """Reusable pagination parameters for API endpoints."""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        size: int = Query(20, ge=1, le=100, description="Items per page"),
    ) -> None:
        self.page = page
        self.size = size
        self.skip = (page - 1) * size
