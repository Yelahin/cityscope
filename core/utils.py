# admin
from django.contrib import admin


class RatingListFilter(admin.SimpleListFilter):
    title = "Rating level"
    parameter_name = "rating"

    rating = [(0, 0.9), (1, 1.9), (2, 2.9), (3, 3.9), (4, 4.9), (5, 5.0)]

    def lookups(self, request, model_admin):
        # Create lookups. First value for url, second value for admin panel
        result = [
            [
                tup[0],
                f"{tup[0]} - {tup[1]}",  # <- example: (2, "2 - 2.9")
            ]
            for tup in self.rating
        ]

        # Add lookup for empty rating
        emtpy_value = ("empty", "empty")
        result.append(emtpy_value)

        return result

    def queryset(self, request, queryset):
        # Return all records with empty rating
        if self.value() == "empty":
            return queryset.filter(rating__isnull=True)

        # Filter records by rating
        if self.value():
            min_value = float(self.value()[0])
            max_value = min_value + 0.9
            return queryset.filter(
                rating__gte=min_value, rating__lte=max_value
            )

        # Return all records
        return queryset.all()
