/**
 * Natural-language descriptions the model compares a name against (zero-shot).
 * These are descriptions of *meaning*, not trigger words; the model generalises beyond them.
 */
export const EXPENSE_PROTOS: Record<string, string[]> = {
  home: ["house rent", "monthly rent and society maintenance", "home loan or housing payment"],
  groceries: ["buying groceries and vegetables", "supermarket or kirana shopping", "milk, fruit, flour, oil and household staples"],
  food: ["a meal at a restaurant", "eating out, street food, chole bhature, biryani, dosa, thali", "ordering food online, lunch or dinner", "fast food, pizza, burgers and takeaway"],
  coffee: ["coffee, tea and cafe snacks", "sweets, desserts and ice cream", "bakery items and light snacks"],
  bills: ["electricity bill", "water and gas bill", "monthly utility bills"],
  internet: ["broadband and wifi bill", "internet connection plan"],
  phone: ["mobile phone recharge", "phone bill and SIM plan"],
  transport: ["bus, metro and train fare", "auto rickshaw and cab rides", "daily commute and transport"],
  car: ["petrol, diesel and fuel", "car or bike servicing and repair", "vehicle insurance, parking and tolls"],
  health: ["doctor visit and medicines", "dentist, hospital and medical tests", "health check-up and pharmacy"],
  insurance: ["insurance premium", "life or health insurance policy payment"],
  education: ["school or college fees", "tuition, courses and books", "exam and training fees"],
  kids: ["childcare and baby supplies", "toys, diapers and kids items", "family and parents' expenses"],
  fun: ["movies, streaming and OTT subscriptions", "games and entertainment", "concert tickets and hobbies"],
  shopping: ["online shopping and gadgets", "buying things from a mall or market", "home decor and accessories"],
  clothes: ["clothes, shoes and fashion", "tailoring and clothing purchases"],
  fitness: ["gym membership and yoga classes", "sports and fitness expenses"],
  travel: ["holiday and trip expenses", "flight tickets and hotel booking for vacation"],
  gift: ["gifts for friends and family", "donation, charity and festival spending", "wedding and birthday expenses"],
  savings: ["emergency fund and savings deposit", "recurring deposit and fixed deposit", "money set aside for the future"],
  invest: ["mutual fund SIP", "stocks, gold and investments", "PPF, NPS and retirement contributions"],
  debt: ["loan EMI repayment", "credit card bill payment", "debt and interest payments"],
};

export const COST_PROTOS: Record<string, string[]> = {
  hotel: ["hotel, hostel or homestay stay", "room booking and accommodation", "resort or airbnb"],
  flight: ["flight ticket and airfare", "airline booking"],
  train: ["train ticket", "railway reservation"],
  bus: ["bus ticket", "volvo or sleeper bus fare"],
  cab: ["cab, taxi and car rental on the trip", "local transport, auto and rides"],
  fuel: ["petrol, tolls and parking on a road trip"],
  ferry: ["ferry, boat or cruise ride"],
  food: ["a meal at a restaurant", "local food, street food, chole bhature, biryani, thali", "breakfast, lunch or dinner on the trip"],
  cafe: ["cafe, coffee and drinks", "snacks, desserts and ice cream", "beer, cocktails and bar"],
  ticket: ["entry tickets for museums and parks", "show or attraction passes"],
  activity: ["adventure activity like scuba, rafting or paragliding", "guided tour or safari", "water sports"],
  photo: ["sightseeing and photography", "local guide fee"],
  hill: ["trek, hike and camping", "trail and campsite fees"],
  shopping: ["souvenirs and gifts to bring back", "shopping at local markets"],
  visa: ["visa, passport and travel permits", "documents and forex"],
  insurance: ["travel insurance", "safety and medical cover for the trip"],
  sim: ["local SIM card and data plan", "roaming or eSIM"],
  city: ["city pass and combo tickets"],
};
