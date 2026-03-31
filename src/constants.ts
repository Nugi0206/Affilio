/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee

export const CURRENCY_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export const DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeStyle: 'short',
});

export const APP_NAME = "AffiliateHub";
export const APP_DESCRIPTION = "Platform Affiliate Marketing Terkemuka di Indonesia";

export const INDONESIAN_BANKS = [
  "BCA",
  "Mandiri",
  "BNI",
  "BRI",
  "CIMB Niaga",
  "Permata",
  "Danamon",
  "BSI",
  "GoPay",
  "OVO",
  "Dana",
  "ShopeePay"
];
