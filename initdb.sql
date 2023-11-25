CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "address" VARCHAR(50)
);
INSERT INTO public.users
(user_name, "password", "role", "address")
VALUES('admin', 'password', 'admin', '0xC17E6B24f68e2D4380fCc1C690B555f537960339');

ALTER SEQUENCE users_id_seq RESTART WITH 100;

CREATE TABLE IF NOT EXISTS public.balances (
	user_id INT NOT NULL,
	reward_token INT NULL,
	penalty_token INT NULL,
	reputation_token INT NULL,
	CONSTRAINT balances_pkey PRIMARY KEY (user_id)
);
ALTER TABLE public.balances ADD CONSTRAINT balances_userid_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--DROP TABLE  public.reward_reasons
CREATE TABLE IF NOT EXISTS  public.achievements(
	id SERIAL NOT NULL, 
	"name" VARCHAR(500), 
	"value" INT);
INSERT INTO public.achievements("name", "value")
VALUES
	('SIG/TWG/SC Meeting Participation', 10),
	('SIG/TWG/SC Meeting Chair', 5),
	('SIG/TWG/SC Meeting Written Contribution', 100),
	('SIG/TWG/SC Meeting  Main Editor of a Written Contribution', 200),
	('SIG/TWG/SC EEA Project Contributions (Development or Compute)',	1000),
	('SIG/TWG/SC EEA Project Manager or Highly Specialized Resource',		2000),
	('SIG/TWG/SC EEA Project Financial or Resource Sponsor', 	10000)	
;

--DROP TABLE public.list_redeemfor
CREATE TABLE IF NOT EXISTS public.swags(
	id SERIAL NOT NULL, 
	"name" VARCHAR(500), 
	"value" int, 
	CONSTRAINT swags_pkey PRIMARY KEY (id));
INSERT INTO public.swags("name", "value")
VALUES
	( 'EEA Shirt ', 10),
	( 'Dinner with Ron', 100),
	( 'Marley Autographed Shades', 1000)
;

--DROP TABLE public.request
CREATE TABLE IF NOT EXISTS public.requests(
	id SERIAL NOT NULL, 
	employee_id INT NOT NULL REFERENCES public.users(id),
	completed_at TIMESTAMP,
	swag_id INT NULL REFERENCES public.swags(id),
	is_completed BOOLEAN,
	CONSTRAINT requests_pkey PRIMARY KEY (id)
);