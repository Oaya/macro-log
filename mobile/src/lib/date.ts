import moment from "moment";

export function formatDateToISO(date: Date) {
	return moment(date).format("YYYY-MM-DD");
}

// Parse/format as local calendar dates (not UTC) so the picker's day
// doesn't shift when the local timezone is ahead of or behind UTC.
export function parseISODate(value: string | null): Date {
	const parsed = moment(value, "YYYY-MM-DD", true);
	return parsed.isValid() ? parsed.toDate() : new Date();
}
