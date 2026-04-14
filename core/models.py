import shortuuid
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify

# Create your models here.


class SlugifyModel(models.Model):
    class Meta:
        abstract = True

    slug = models.SlugField(max_length=100, unique=True, blank=True, editable=False)

    # Generate slug automatically if slug was not provided
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class City(SlugifyModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "City"
        verbose_name_plural = "Cities"

    def __str__(self):
        return self.name


class Category(SlugifyModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class SourceRecord(models.Model):
    class Meta:
        verbose_name = "Source Record"
        verbose_name_plural = "Source Records"

    API = "API"
    SOURCE_TYPE_CHOICES = {API: "Api"}

    name = models.CharField(max_length=100)
    source_type = models.CharField(choices=SOURCE_TYPE_CHOICES, max_length=50)

    def __str__(self):
        return self.name


class Place(models.Model):
    class Meta:
        verbose_name = "Place"
        verbose_name_plural = "Places"

    CLOSED = "CLOSED"
    OPEN = "OPEN"
    STATUS_CHOICES = {CLOSED: "Closed", OPEN: "Open"}

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=200, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=7, 
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)],
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)],
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True
    )
    sourcerecord = models.ForeignKey(SourceRecord, on_delete=models.CASCADE)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    rating = models.FloatField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
    )
    price_level = models.CharField(max_length=20, blank=True, null=True)
    opening_status = models.CharField(
        blank=True, null=True, choices=STATUS_CHOICES
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "latitude", "longitude"], name="unique_place"
            )
        ]

    def prepare(self, used_slugs=None):
        """This method prevent integrity error in bulk_create"""
        if not self.slug:
            slug = slugify(self.name)
            if Place.objects.filter(slug=slug).exists() or (
                used_slugs is not None and slug in used_slugs
            ):
                self.slug = f"{slug}-{shortuuid.uuid()}"
            else:
                self.slug = slug
            if used_slugs is not None:
                used_slugs.add(self.slug)

    def save(self, *args, **kwargs):
        self.prepare()
        super().save(*args, **kwargs)
