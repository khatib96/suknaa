import { Controller, Get, Header } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReferenceService } from "./reference.service";
import type {
  ReferenceAmenitiesResponse,
  ReferenceLabelsResponse,
} from "./reference.types";

const CACHE_HEADER = "public, max-age=300";

@ApiTags("Reference")
@Controller("reference")
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Get("vacation-rental-types")
  @ApiOperation({ summary: "Vacation rental type labels (AR/EN)" })
  @ApiOkResponse({ description: "{ data: ReferenceLabelItem[] }" })
  @Header("Cache-Control", CACHE_HEADER)
  getVacationRentalTypes(): ReferenceLabelsResponse {
    return this.referenceService.getVacationRentalTypes();
  }

  @Get("space-types")
  @ApiOperation({ summary: "Space type labels (AR/EN)" })
  @ApiOkResponse({ description: "{ data: ReferenceLabelItem[] }" })
  @Header("Cache-Control", CACHE_HEADER)
  getSpaceTypes(): ReferenceLabelsResponse {
    return this.referenceService.getSpaceTypes();
  }

  @Get("booking-modes")
  @ApiOperation({ summary: "Booking mode labels (AR/EN)" })
  @ApiOkResponse({ description: "{ data: ReferenceLabelItem[] }" })
  @Header("Cache-Control", CACHE_HEADER)
  getBookingModes(): ReferenceLabelsResponse {
    return this.referenceService.getBookingModes();
  }

  @Get("cancellation-policies")
  @ApiOperation({ summary: "Cancellation policy labels (AR/EN)" })
  @ApiOkResponse({ description: "{ data: ReferenceLabelItem[] }" })
  @Header("Cache-Control", CACHE_HEADER)
  getCancellationPolicies(): ReferenceLabelsResponse {
    return this.referenceService.getCancellationPolicies();
  }

  @Get("amenities")
  @ApiOperation({ summary: "Active amenity catalogue with applicability flags" })
  @ApiOkResponse({ description: "{ data: ReferenceAmenityItem[] }" })
  @Header("Cache-Control", CACHE_HEADER)
  getAmenities(): Promise<ReferenceAmenitiesResponse> {
    return this.referenceService.getAmenities();
  }
}
