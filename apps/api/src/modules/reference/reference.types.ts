export interface ReferenceLabelItem {
  key: string;
  label_ar: string;
  label_en: string;
}

export interface ReferenceLabelsResponse {
  data: ReferenceLabelItem[];
}

export interface ReferenceAmenityItem {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  icon_name: string | null;
  category: string;
  applies_to_vacation_rental: boolean;
  applies_to_vacation_rental_space: boolean;
  applies_to_hotel: boolean;
  applies_to_room_type: boolean;
}

export interface ReferenceAmenitiesResponse {
  data: ReferenceAmenityItem[];
}
