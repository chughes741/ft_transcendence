import { PartialType } from "@nestjs/mapped-types";

export class FetchMatchHistoryDto {
  id: number;
}

export class CreateProfileDto {}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  id: number;
}
