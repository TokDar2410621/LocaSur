/**
 * API Housing Blog - Endpoints pour le blog SEO et les landing pages villes
 */

import api from './api';

// ============================================
// TYPES
// ============================================

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  post_count: number;
}

export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  featured_image_alt: string;
  category: {
    name: string;
    slug: string;
  } | null;
  tags: { name: string; slug: string }[];
  author: {
    id: number;
    name: string;
  } | null;
  target_city: string;
  published_at: string | null;
  view_count: number;
  url: string;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  target_region: string;
  updated_at: string;
  schema_type: string;
  faq_data: { question: string; answer: string }[] | null;
}

export interface CityLandingPageSummary {
  id: number;
  city_name: string;
  slug: string;
  region: string;
  meta_title: string;
  total_listings: number;
  avg_rent_1_bedroom: number | null;
  hero_image: string;
  url: string;
}

export interface CityLandingPage extends CityLandingPageSummary {
  meta_description: string;
  h1_title: string;
  intro_text: string;
  main_content: string;
  neighborhoods: { name: string; description: string }[] | null;
  avg_rent_studio: number | null;
  avg_rent_2_bedroom: number | null;
  avg_rent_3_bedroom: number | null;
  faq_data: { question: string; answer: string }[] | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Pagination {
  page: number;
  total_pages: number;
  total_posts: number;
  has_next: boolean;
  has_previous: boolean;
}

// ============================================
// STUDENT HOUSING SEO TYPES
// ============================================

export interface StudentHousingPillar {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  main_content: string;
  faq_data: { question: string; answer: string }[] | null;
  total_cities: number;
  total_schools: number;
  total_listings: number;
  url: string;
}

export interface CityStudentPageSummary {
  city_name: string;
  slug: string;
  region: string;
  url: string;
  meta_title?: string;
  cegeps_count?: number;
  universities_count?: number;
  total_student_listings?: number;
  avg_rent_studio?: number | null;
}

export interface SchoolPageSummary {
  id?: number;
  name: string;
  slug: string;
  school_type: string;
  city_name?: string;
  city_slug?: string;
  url: string;
  full_name?: string;
  total_nearby_listings?: number;
  avg_rent_studio?: number | null;
}

export interface CityStudentPage extends CityStudentPageSummary {
  id: number;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  main_content: string;
  cegeps: string[] | null;
  universities: string[] | null;
  student_neighborhoods: string[] | null;
  avg_rent_1_bedroom: number | null;
  avg_rent_colocation: number | null;
  faq_data: { question: string; answer: string }[] | null;
  latitude: number | null;
  longitude: number | null;
}

export interface SchoolPage extends SchoolPageSummary {
  id: number;
  full_name: string;
  region: string;
  address: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  main_content: string;
  nearby_neighborhoods: string[] | null;
  avg_rent_colocation: number | null;
  student_population: number | null;
  faq_data: { question: string; answer: string }[] | null;
  latitude: number | null;
  longitude: number | null;
}

export interface StudentPropertyTypePage {
  id: number;
  property_type: string;
  property_type_display: string;
  city_name: string;
  city_slug: string;
  region?: string;
  meta_title: string;
  meta_description?: string;
  h1_title?: string;
  intro_text?: string;
  main_content?: string;
  avg_rent: number | null;
  total_listings: number;
  recommended_neighborhoods?: string[] | null;
  faq_data?: { question: string; answer: string }[] | null;
  url: string;
}

export interface StudentNeighborhoodPage {
  id: number;
  neighborhood_name: string;
  neighborhood_slug: string;
  city_name: string;
  city_slug: string;
  region?: string;
  nearby_schools?: string[] | null;
  meta_title?: string;
  meta_description?: string;
  h1_title?: string;
  intro_text?: string;
  main_content?: string;
  avg_rent_studio?: number | null;
  avg_rent_1_bedroom?: number | null;
  total_listings?: number;
  faq_data?: { question: string; answer: string }[] | null;
  latitude?: number | null;
  longitude?: number | null;
  url: string;
}

export interface StudentPriceAnalysisPage {
  id: number;
  city_name: string;
  city_slug: string;
  region: string;
  meta_title: string;
  meta_description?: string;
  h1_title?: string;
  intro_text?: string;
  main_content?: string;
  price_by_type?: Record<string, number> | null;
  price_by_neighborhood?: Record<string, number> | null;
  price_trend?: string | null;
  comparison_with_region?: Record<string, any> | null;
  faq_data?: { question: string; answer: string }[] | null;
  last_price_update?: string | null;
  url: string;
}

export interface CityComparisonPage {
  id: number;
  city1_name: string;
  city1_slug: string;
  city2_name: string;
  city2_slug: string;
  slug: string;
  meta_title: string;
  meta_description?: string;
  h1_title?: string;
  intro_text?: string;
  main_content?: string;
  comparison_data?: Record<string, any> | null;
  faq_data?: { question: string; answer: string }[] | null;
  url: string;
}

// ============================================
// BLOG API
// ============================================

/**
 * Récupérer la liste des articles de blog
 */
export async function getBlogPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  city?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.city) searchParams.set('city', params.city);
  if (params?.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString();
  const url = `/api/marketing/blog/posts/${queryString ? '?' + queryString : ''}`;

  return api.get<{
    success: boolean;
    posts: BlogPostSummary[];
    pagination: Pagination;
  }>(url);
}

/**
 * Récupérer un article de blog par son slug
 */
export async function getBlogPost(slug: string) {
  return api.get<{
    success: boolean;
    post: BlogPost;
    related_posts: {
      title: string;
      slug: string;
      excerpt: string;
      featured_image: string;
      url: string;
    }[];
  }>(`/api/marketing/blog/posts/${slug}/`);
}

/**
 * Récupérer les catégories du blog
 */
export async function getBlogCategories() {
  return api.get<{
    success: boolean;
    categories: BlogCategory[];
  }>('/api/marketing/blog/categories/');
}

/**
 * Récupérer les tags du blog
 */
export async function getBlogTags() {
  return api.get<{
    success: boolean;
    tags: BlogTag[];
  }>('/api/marketing/blog/tags/');
}

// ============================================
// CITY LANDING PAGES API
// ============================================

/**
 * Récupérer la liste des landing pages villes
 */
export async function getCityLandingPages() {
  return api.get<{
    success: boolean;
    cities: CityLandingPageSummary[];
  }>('/api/marketing/cities/');
}

/**
 * Récupérer une landing page ville par son slug
 */
export async function getCityLandingPage(slug: string) {
  return api.get<{
    success: boolean;
    city: CityLandingPage;
    related_posts: {
      title: string;
      slug: string;
      excerpt: string;
      featured_image: string;
      url: string;
    }[];
  }>(`/api/marketing/cities/${slug}/`);
}

// ============================================
// STUDENT HOUSING SEO API
// ============================================

/**
 * Page pilier logement étudiant
 * GET /api/marketing/student-housing/
 */
export async function getStudentHousingPillar() {
  const response = await api.get<{
    success: boolean;
    page: StudentHousingPillar;
    cities: CityStudentPageSummary[];
    schools: SchoolPageSummary[];
  }>('/api/marketing/student-housing/');

  // Transform response to match component expectation
  return {
    success: response.success,
    pillar: response.page,
    cities: response.cities,
    schools: response.schools,
  };
}

/**
 * Liste des pages villes étudiantes
 * GET /api/marketing/student-housing/cities/
 */
export async function getCityStudentPages() {
  return api.get<{
    success: boolean;
    cities: CityStudentPageSummary[];
  }>('/api/marketing/student-housing/cities/');
}

/**
 * Détail d'une page ville étudiante
 * GET /api/marketing/student-housing/cities/<slug>/
 */
export async function getCityStudentPage(citySlug: string) {
  return api.get<{
    success: boolean;
    city: CityStudentPage;
    schools: SchoolPageSummary[];
    neighborhoods: { neighborhood_name: string; neighborhood_slug: string; url: string }[];
  }>(`/api/marketing/student-housing/cities/${citySlug}/`);
}

/**
 * Liste des pages écoles
 * GET /api/marketing/schools/
 */
export async function getSchoolPages(params?: { type?: string; city?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.city) searchParams.set('city', params.city);

  const queryString = searchParams.toString();
  const url = `/api/marketing/schools/${queryString ? '?' + queryString : ''}`;

  return api.get<{
    success: boolean;
    schools: SchoolPageSummary[];
  }>(url);
}

/**
 * Détail d'une page école
 * GET /api/marketing/schools/<slug>/
 */
export async function getSchoolPage(schoolSlug: string) {
  return api.get<{
    success: boolean;
    school: SchoolPage;
  }>(`/api/marketing/schools/${schoolSlug}/`);
}

/**
 * Liste des pages type de logement étudiant
 * GET /api/marketing/student-housing/types/
 */
export async function getStudentPropertyTypePages(params?: { type?: string; city?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.city) searchParams.set('city', params.city);

  const queryString = searchParams.toString();
  const url = `/api/marketing/student-housing/types/${queryString ? '?' + queryString : ''}`;

  return api.get<{
    success: boolean;
    pages: StudentPropertyTypePage[];
  }>(url);
}

/**
 * Détail d'une page type de logement étudiant
 * GET /api/marketing/student-housing/types/<type>/<city>/
 */
export async function getStudentPropertyTypePage(typeSlug: string, citySlug: string) {
  return api.get<{
    success: boolean;
    page: StudentPropertyTypePage;
  }>(`/api/marketing/student-housing/types/${typeSlug}/${citySlug}/`);
}

/**
 * Liste des pages quartiers étudiants
 * GET /api/marketing/student-housing/neighborhoods/
 */
export async function getStudentNeighborhoodPages(params?: { city?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.city) searchParams.set('city', params.city);

  const queryString = searchParams.toString();
  const url = `/api/marketing/student-housing/neighborhoods/${queryString ? '?' + queryString : ''}`;

  return api.get<{
    success: boolean;
    neighborhoods: StudentNeighborhoodPage[];
  }>(url);
}

/**
 * Détail d'une page quartier étudiant
 * GET /api/marketing/student-housing/neighborhoods/<city>/<neighborhood>/
 */
export async function getStudentNeighborhoodPage(citySlug: string, neighborhoodSlug: string) {
  return api.get<{
    success: boolean;
    neighborhood: StudentNeighborhoodPage;
  }>(`/api/marketing/student-housing/neighborhoods/${citySlug}/${neighborhoodSlug}/`);
}

/**
 * Liste des pages analyse de prix
 * GET /api/marketing/student-housing/prices/
 */
export async function getStudentPriceAnalysisPages() {
  return api.get<{
    success: boolean;
    pages: StudentPriceAnalysisPage[];
  }>('/api/marketing/student-housing/prices/');
}

/**
 * Détail d'une page analyse de prix
 * GET /api/marketing/student-housing/prices/<city>/
 */
export async function getStudentPriceAnalysisPage(citySlug: string) {
  const response = await api.get<{
    success: boolean;
    page: StudentPriceAnalysisPage;
  }>(`/api/marketing/student-housing/prices/${citySlug}/`);

  // Transform response to match component expectation
  return {
    success: response.success,
    analysis: response.page,
    comparison_cities: [],
  };
}

/**
 * Liste des pages comparaison villes
 * GET /api/marketing/student-housing/comparisons/
 */
export async function getCityComparisonPages() {
  return api.get<{
    success: boolean;
    comparisons: CityComparisonPage[];
  }>('/api/marketing/student-housing/comparisons/');
}

/**
 * Détail d'une page comparaison villes
 * GET /api/marketing/student-housing/compare/<slug>/
 */
export async function getCityComparisonPage(slug: string) {
  const response = await api.get<{
    success: boolean;
    comparison: CityComparisonPage;
  }>(`/api/marketing/student-housing/compare/${slug}/`);

  return response;
}
